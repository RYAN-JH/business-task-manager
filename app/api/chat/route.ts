import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  getNextQuestion, 
  appendQuestionToResponse, 
  updateProfileFromResponse,
  questionTemplates
} from '@/lib/question-system';
import { ProactiveQuestionService } from '@/lib/proactive-questions';
import { AdminService } from '@/lib/admin-service';
import { AdminPersonaQuestionService } from '@/lib/admin-persona-question-service';

import { 
  loadUserProfile, 
  saveUserProfile, 
  saveQuestion, 
  getRecentQuestions 
} from '@/lib/user-profile-service';
import {
  generatePersonalizedPrompt,
  analyzeMessageContext,
  PersonalizationContext
} from '@/lib/personalized-prompt-system';
import {
  enhanceResponseByPersona,
  formatResponse,
  validateResponseQuality,
  ResponseEnhancementContext
} from '@/lib/response-enhancement-system';
import { MasterProfileService } from '@/lib/master-profile-service';
import { PersonalizedWritingEngine, WritingRequest } from '@/lib/personalized-writing-engine';
import {
  analyzeConversationContext,
  adjustResponseForContext,
  checkConversationContinuity,
  ConversationMessage
} from '@/lib/conversation-context-system';
import { logger } from '@/lib/console-utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, persona, conversationId } = body;

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message and conversationId are required' },
        { status: 400 }
      );
    }

    // 대화가 사용자 소유인지 확인
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 최근 대화 내역 가져오기 (프롬프트 생성을 위해 먼저 로드)
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // 마스터 프로필 로드 및 대화 세션 시작
    const masterProfile = await MasterProfileService.loadMasterProfile(session.user.id);
    let conversationSession = MasterProfileService.startConversationSession(session.user.id, conversationId);
    
    // 기존 프로필 호환성을 위해 비즈니스 프로필 추출
    const userProfile = masterProfile.businessProfile;
    const messageContext = analyzeMessageContext(message, userProfile);
    
    // 대화 메시지를 ConversationMessage 형태로 변환
    const conversationMessages: ConversationMessage[] = recentMessages.map(msg => ({
      id: msg.id,
      type: msg.type as 'USER' | 'AI',
      content: msg.content,
      persona: msg.persona || undefined,
      createdAt: msg.createdAt
    }));
    
    // 대화 컨텍스트 분석
    const conversationContext = analyzeConversationContext(conversationMessages, userProfile);
    const continuity = checkConversationContinuity(conversationMessages);
    
    const personalizationContext: PersonalizationContext = {
      userProfile,
      currentPersona: persona || 'general',
      userMessage: message,
      conversationHistory: recentMessages
    };
    
    // Admin 사용자 확인 (시스템 프롬프트 생성 전에 먼저 체크)
    let isAdminUser = false;
    let adminPersonaType: 'moment.ryan' | 'atozit' = 'moment.ryan';
    
    try {
      isAdminUser = await AdminService.isAdminUser(session.user.email || '');
      if (isAdminUser) {
        const adminFeatures = await AdminService.getAdminFeatures(session.user.email || '');
        adminPersonaType = adminFeatures.mailyUsername === 'moment.ryan' ? 'moment.ryan' : 'atozit';
        logger.admin('Admin 사용자 감지', { email: session.user.email, personaType: adminPersonaType });
      }
    } catch (error) {
      logger.error('Admin 확인 중 오류', error);
    }

    // 개인화된 시스템 프롬프트 생성 (Admin 여부에 따라 달리 생성)
    let systemPrompt;
    if (isAdminUser) {
      systemPrompt = generateAdminSystemPrompt(personalizationContext, adminPersonaType);
    } else {
      systemPrompt = generatePersonalizedPrompt(personalizationContext);
    }
    
    // 대화 컨텍스트를 시스템 프롬프트에 추가
    if (conversationContext.conversationLength > 2) {
      systemPrompt += `\n\n# 🔄 대화 컨텍스트 정보\n`;
      systemPrompt += `- 현재 주제: ${conversationContext.currentTopic}\n`;
      systemPrompt += `- 사용자 의도: ${conversationContext.userIntent}\n`;
      systemPrompt += `- 대화 길이: ${conversationContext.conversationLength}회\n`;
      
      if (continuity.isFollowUp) {
        systemPrompt += `- 이어지는 대화입니다. 이전 맥락을 고려하여 응답하세요.\n`;
      }
      
      if (continuity.topicShift) {
        systemPrompt += `- 주제가 변경되었습니다. 새로운 주제에 집중하세요.\n`;
      }
    }
    
    const aiPersona = persona || 'general';
    
    logger.persona('API 페르소나 처리', {
      receivedPersona: persona,
      finalPersona: aiPersona,
      userMessage: message.substring(0, 50) + '...'
    });
    
    logger.debug('컨텍스트 분석', {
      completionLevel: userProfile.completionLevel,
      businessType: userProfile.businessType,
      persona: aiPersona,
      messageTopics: messageContext.topics,
      conversationTopic: conversationContext.currentTopic,
      userIntent: conversationContext.userIntent,
      sentiment: conversationContext.userSentiment
    });

    // 사용자 메시지를 세션에 추가
    conversationSession = MasterProfileService.addMessageToSession(
      conversationSession, 
      'USER', 
      message
    );

    // 사용자 메시지 저장
    await prisma.message.create({
      data: {
        conversationId,
        type: 'USER',
        content: message
      }
    });

    // Claude API 호출
    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        ...recentMessages.slice(0, -1).map((msg: any) => ({
          role: msg.type === 'USER' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ]
    });

    let aiResponse = completion.content[0].type === 'text' ? completion.content[0].text : '';
    
    // 개인화된 글쓰기 엔진으로 응답 개선
    const writingRequest: WritingRequest = {
      content: aiResponse,
      purpose: 'response',
      tone: 'match_user',
      length: masterProfile.learnedPatterns.preferredResponseLength,
      includeEmojis: masterProfile.writingStyle.writingPatterns.usesEmojis,
      context: conversationContext.currentTopic
    };
    
    const personalizedResult = await MasterProfileService.generatePersonalizedContent(
      session.user.id, 
      writingRequest
    );
    
    // 개인화된 응답으로 교체하되, 신뢰도가 낮으면 기존 향상 로직 사용
    if (personalizedResult.confidenceScore > 60) {
      aiResponse = personalizedResult.personalizedContent;
      console.log('📝 개인화 엔진 적용:', {
        confidenceScore: personalizedResult.confidenceScore,
        styleApplications: personalizedResult.styleApplication
      });
    } else {
      // 기존 향상 로직 사용
      const enhancementContext: ResponseEnhancementContext = {
        userProfile,
        currentPersona: aiPersona,
        userMessage: message,
        aiResponse,
        messageTopics: messageContext.topics
      };
      
      aiResponse = enhanceResponseByPersona(enhancementContext);
      aiResponse = adjustResponseForContext(aiResponse, conversationContext, userProfile);
      aiResponse = formatResponse(aiResponse, aiPersona);
      console.log('📝 기존 향상 로직 사용 (신뢰도 부족)');
    }
    
    // AI 응답을 세션에 추가
    conversationSession = MasterProfileService.addMessageToSession(
      conversationSession, 
      'AI', 
      message,
      aiResponse
    );
    
    // 응답 품질 검증
    const qualityCheck = validateResponseQuality(aiResponse, userProfile);
    console.log('응답 품질 점수:', qualityCheck.score, qualityCheck);
    
    // 이전 질문에 대한 답변이 있는지 확인하고 프로필 업데이트
    const lastMessage = recentMessages[recentMessages.length - 1]; // 마지막 AI 메시지 확인
    if (lastMessage && lastMessage.type === 'AI') {
      // 이전 AI 메시지에서 질문이 있었는지 확인하고, 현재 사용자 메시지가 그 답변인지 판단
      const questionFound = questionTemplates.find(q => 
        lastMessage.content.includes(q.question)
      );
      
      if (questionFound) {
        // 프로필 업데이트
        const updatedProfile = updateProfileFromResponse(userProfile, questionFound, message);
        await saveUserProfile(session.user.id, updatedProfile);
        console.log('사용자 프로필 업데이트:', questionFound.field, message);
        
        // 업데이트된 프로필을 반영하여 새로운 질문 선택
        userProfile.completionLevel = updatedProfile.completionLevel;
      }
    }

    // Admin 전용 페르소나 강화 시스템 적용 (이미 isAdminUser를 확인했으므로 재사용)
    let questionAdded = false;
    
    if (isAdminUser) {
      logger.admin('Admin 페르소나 강화 시스템 적용');
      
      // 하이브리드 Admin 페르소나 강화 시스템 (DB + Claude AI)
      const questionContext = {
        userMessage: message,
        personaType: adminPersonaType,
        conversationHistory: conversationMessages.map(m => m.content),
        adminEmail: session.user.email || '',
        previousQuestions: recentMessages
          .filter(m => m.content?.includes('?'))
          .map(m => m.content || '')
          .slice(-3) // 최근 3개 질문만
      };

      // 1. 먼저 기존 DB에서 적절한 질문 찾기
      try {
        let adminQuestion = await AdminPersonaQuestionService.findExistingQuestion(questionContext);
        let questionId: string | null = null;

        if (adminQuestion) {
          logger.success('데이터베이스에서 기존 질문 사용', { question: adminQuestion.questionText.substring(0, 50) + '...' });
          aiResponse += `\n\n${adminQuestion.questionText}`;
          questionId = adminQuestion.id;
          await AdminPersonaQuestionService.recordQuestionUsage(adminQuestion.id);
          questionAdded = true;
        } else {
          // 2. 기존 질문이 없으면 Claude AI로 새 질문 생성
          logger.ai('Claude AI로 새로운 Admin 페르소나 질문 생성 중...');
          const generatedQuestion = await AdminPersonaQuestionService.generatePersonaQuestion(questionContext);
          
          if (generatedQuestion) {
            aiResponse += `\n\n${generatedQuestion}`;
            questionAdded = true;
            logger.success('Claude AI 생성 질문 사용', { question: generatedQuestion.substring(0, 50) + '...' });
          } else {
            logger.warning('Claude AI 질문 생성 실패 - fallback 사용');
            const fallbackQuestion = generateAdminPersonaPrompt(message, adminPersonaType, aiResponse);
            if (fallbackQuestion) {
              aiResponse += `\n\n${fallbackQuestion}`;
              questionAdded = true;
            }
          }
        }
      } catch (adminError) {
        logger.error('Admin 페르소나 강화 시스템 오류', adminError);
      }
    }

    // Admin 질문이 없거나 일반 사용자인 경우 기존 질문 시스템 사용
    if (!questionAdded) {
      try {
        const recentQuestionIds = await getRecentQuestions(session.user.id, 24);
        const nextQuestion = await getNextQuestion(userProfile, message, aiPersona);
        
        if (nextQuestion && nextQuestion.id && !recentQuestionIds.includes(nextQuestion.id)) {
          const questionText = 'question' in nextQuestion ? nextQuestion.question : nextQuestion.content?.mainQuestion;
          if (questionText) {
            aiResponse = appendQuestionToResponse(aiResponse, nextQuestion);
            await saveQuestion(session.user.id, nextQuestion.id, questionText);
            console.log('📝 일반 질문 추가:', nextQuestion.id, questionText);
          }
        }
      } catch (questionError) {
        console.error('❌ 일반 질문 시스템 오류:', questionError);
        // 질문 추가 실패해도 기본 응답은 유지
      }
    }

    // AI 응답 저장
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        type: 'AI',
        content: aiResponse,
        persona: aiPersona
      }
    });

    // 대화 정보 업데이트
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: aiResponse.substring(0, 100),
        messageCount: { increment: 2 }, // 사용자 + AI 메시지
        updatedAt: new Date()
      }
    });

    // 🎓 대화 세션 완료 및 학습 수행
    try {
      const updatedMasterProfile = await MasterProfileService.completeConversationAndLearn(
        conversationSession, 
        session.user.id
      );
      
      console.log('🎓 마스터 프로필 학습 완료:', {
        userId: session.user.id,
        conversationId,
        dataRichness: updatedMasterProfile.profileQuality.dataRichness,
        writingStyleConfidence: updatedMasterProfile.writingStyle.confidenceScore,
        totalMessagesAnalyzed: updatedMasterProfile.writingStyle.totalMessagesAnalyzed
      });
      
    } catch (learningError) {
      console.error('🚨 학습 과정 중 오류 발생:', learningError);
      // 학습 실패해도 응답은 정상 반환
    }

    // 응답 검증 및 undefined 방지
    const finalResponse = aiResponse || '죄송합니다. 응답을 생성할 수 없습니다.';
    
    return NextResponse.json({
      response: finalResponse,
      messageId: aiMessage.id,
      persona: aiPersona || 'general'
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin 페르소나 강화를 위한 질문 생성 함수
function generateAdminPersonaPrompt(userMessage: string, personaType: string, currentResponse: string): string | null {
  const lowerMessage = userMessage.toLowerCase();
  
  // moment.ryan 페르소나 강화 질문들
  const momentRyanPrompts = {
    strategy: [
      "페르소나 고도화를 해보자. 마케팅 전략을 수립할 때 당신만의 독특한 접근법이 있나요? 어떤 원칙을 가지고 브랜드를 성장시키나요?",
      "콘텐츠 전략에서 가장 중요하게 생각하는 요소는 무엇인가요? 타겟 오디언스와의 진정성 있는 소통을 위해 어떤 방식을 사용하시나요?",
      "SNS 마케팅에서 단순한 홍보를 넘어 브랜드 스토리텔링을 어떻게 구현하시나요? 팔로워들과의 관계 구축 철학을 들려주세요."
    ],
    content: [
      "콘텐츠 제작 과정에서 영감을 어디서 얻으시나요? 아이디어를 실제 콘텐츠로 발전시키는 당신만의 프로세스가 있나요?",
      "브랜드 메시징에서 일관성과 창의성의 균형을 어떻게 맞추시나요? 메시지 전달력을 높이는 특별한 방법이 있나요?",
      "트렌드를 활용하면서도 브랜드 고유성을 유지하는 방법은 무엇인가요? 시의성과 진정성을 모두 잡는 비결을 알려주세요."
    ],
    challenge: [
      "어려운 상황에서도 브랜드 가치를 지켜나가는 방법은 무엇인가요? 위기를 기회로 바꾼 경험이나 철학이 있나요?",
      "예산이나 자원이 제한적인 스타트업들에게 어떤 마케팅 우선순위를 제안하시나요? 효율적인 성장 전략의 핵심은 무엇인가요?",
      "마케팅 ROI 측정에서 정량적 지표와 정성적 가치를 어떻게 균형있게 평가하시나요?"
    ],
    general: [
      "브랜드들이 어떤 방식으로 고객과의 관계를 만들어가야 한다고 생각하나요? 지속가능한 브랜드 성장의 핵심 요소는 무엇인가요?",
      "디지털 마케팅 환경에서 개인화와 확장성을 동시에 실현하는 방법은 무엇인가요?",
      "마케팅 전문가로서 가장 중요하게 생각하는 가치나 신념이 있나요?"
    ]
  };
  
  // atozit 페르소나 강화 질문들  
  const atozitPrompts = {
    strategy: [
      "브랜드 전략 수립에서 당신만의 철학이나 방법론이 있나요? 강력한 브랜드를 만드는 핵심 요소는 무엇이라고 생각하시나요?",
      "비즈니스 성장과 브랜드 일관성을 동시에 추구할 때 어떤 우선순위로 접근하시나요?",
      "브랜드 포지셔닝에서 차별화 전략을 수립할 때 가장 중요하게 고려하는 요소는 무엇인가요?"
    ],
    content: [
      "브랜드 아이덴티티를 구축할 때 시각적 요소와 메시지 전략의 조화를 어떻게 이루시나요?",
      "고객 경험 설계에서 브랜드 가치를 일관되게 전달하는 방법은 무엇인가요?",
      "브랜딩에서 감정적 연결과 논리적 설득의 균형점을 어떻게 찾으시나요?"
    ],
    challenge: [
      "브랜드 리뉴얼이나 피벗 상황에서 기존 고객을 유지하면서 새로운 방향성을 제시하는 방법은 무엇인가요?",
      "한정된 예산으로 브랜드 인지도를 높이는 효과적인 전략이 있나요?",
      "시장 변화에 빠르게 대응하면서도 브랜드 진정성을 유지하는 비결은 무엇인가요?"
    ],
    general: [
      "브랜드들이 어떤 방식으로 고객과의 관계를 만들어가야 한다고 생각하나요? 신뢰할 수 있는 브랜드의 조건은 무엇인가요?",
      "비즈니스 전략과 브랜딩 전략이 상호 보완되는 이상적인 관계는 어떤 모습인가요?",
      "브랜딩 전문가로서 가장 중요하게 생각하는 원칙이나 가치관이 있나요?"
    ]
  };
  
  const prompts = personaType === 'moment.ryan' ? momentRyanPrompts : atozitPrompts;
  
  // 사용자 메시지 분석하여 적절한 카테고리 선택
  let selectedCategory = 'general';
  
  if (lowerMessage.includes('전략') || lowerMessage.includes('계획') || lowerMessage.includes('방향')) {
    selectedCategory = 'strategy';
  } else if (lowerMessage.includes('콘텐츠') || lowerMessage.includes('브랜딩') || lowerMessage.includes('메시지')) {
    selectedCategory = 'content';  
  } else if (lowerMessage.includes('어려') || lowerMessage.includes('문제') || lowerMessage.includes('고민') || 
             lowerMessage.includes('힘들') || lowerMessage.includes('모르겠') || lowerMessage.includes('막막')) {
    selectedCategory = 'challenge';
  }
  
  const categoryPrompts = prompts[selectedCategory as keyof typeof prompts];
  const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  
  console.log(`🎯 Admin 페르소나 강화: ${personaType} - ${selectedCategory} 카테고리 선택`);
  
  return randomPrompt;
}

// Admin 전용 시스템 프롬프트 생성 함수
function generateAdminSystemPrompt(personalizationContext: PersonalizationContext, adminPersonaType: 'moment.ryan' | 'atozit'): string {
  const basePersonaInfo = adminPersonaType === 'moment.ryan' 
    ? {
        name: 'Moment Ryan',
        role: '디지털 마케팅 전문가이자 콘텐츠 크리에이터',
        expertise: 'SNS 마케팅, 콘텐츠 전략, 브랜드 스토리텔링',
        followers: 'Threads 4.1만, Instagram 16.5만 팔로워',
        approach: '데이터 기반의 창의적 마케팅 전략'
      }
    : {
        name: 'AtoZ IT',
        role: '브랜딩 및 비즈니스 전략 전문가', 
        expertise: '브랜드 아이덴티티, 고객 경험 설계, 비즈니스 성장',
        approach: '체계적이고 전략적인 접근 방식',
        focus: '장기적 브랜드 가치 창출'
      };

  return `# ${basePersonaInfo.name} 페르소나 강화 AI

## 🎯 핵심 역할
당신은 ${basePersonaInfo.name} 페르소나의 전문성을 더욱 풍성하게 만들기 위한 전문 상담역입니다. 
현재 대화하고 있는 사용자는 ${basePersonaInfo.name} 본인으로, 일반 고객들과 상담할 때 사용할 페르소나를 고도화하려고 합니다.

## 🔑 대화 목적  
- 일반적인 비즈니스 조언 제공 ❌
- 페르소나 전문성 탐구 및 개발 ✅
- 독특한 관점과 방법론 발굴 ✅ 
- 실무 경험과 철학 정리 ✅

## 🎭 ${basePersonaInfo.name} 페르소나 정보
- **역할**: ${basePersonaInfo.role}
- **전문분야**: ${basePersonaInfo.expertise}
${adminPersonaType === 'moment.ryan' ? `- **영향력**: ${basePersonaInfo.followers}` : ''}
- **접근방식**: ${basePersonaInfo.approach}
${adminPersonaType === 'atozit' ? `- **중점영역**: ${basePersonaInfo.focus}` : ''}

## 📋 대화 방식
1. **동료 전문가로 대화**: 고객이 아닌 동료 전문가로 인식하고 대화
2. **경험과 철학 탐구**: 구체적인 경험, 방법론, 원칙을 깊이 있게 탐구
3. **페르소나 특화 조언**: ${basePersonaInfo.name}의 전문성에 특화된 인사이트 제공
4. **실무 중심 대화**: 이론보다는 실제 경험과 노하우에 집중

## 💬 응답 스타일
- 전문가 간 수평적 대화 톤 사용
- "고객에게는 이렇게 조언하겠지만..." 식의 메타적 관점 포함
- 구체적인 사례와 경험 기반 조언
- ${basePersonaInfo.name}만의 독특한 관점과 차별점 강조

## 🚫 주의사항
- 일반적인 비즈니스 컨설팅은 하지 말 것
- 너무 교과서적인 조언은 피할 것  
- ${basePersonaInfo.name}의 정체성과 맞지 않는 조언은 제외

현재 사용자의 메시지: "${personalizationContext.userMessage}"

위 메시지에 대해 ${basePersonaInfo.name} 페르소나 강화에 도움이 되는 전문적이고 심도 있는 대화를 나누세요.`;
}