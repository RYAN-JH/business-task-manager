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

    // 📚 질문 데이터베이스에서 참고 자료 수집 (Claude가 참고할 수 있도록)
    let referenceQuestions: string[] = [];
    
    if (isAdminUser) {
      try {
        // Admin 페르소나 질문들을 참고 자료로 수집
        const questionContext = {
          userMessage: message,
          personaType: adminPersonaType,
          conversationHistory: conversationMessages.map(m => m.content),
          adminEmail: session.user.email || '',
          previousQuestions: recentMessages
            .filter(m => m.content?.includes('?'))
            .map(m => m.content || '')
            .slice(-3)
        };

        const existingQuestion = await AdminPersonaQuestionService.findExistingQuestion(questionContext);
        if (existingQuestion) {
          referenceQuestions.push(existingQuestion.questionText);
        }
        
        // 현재는 기존 질문만 사용 (추후 관련 질문 시스템 확장 가능)
        // const relatedQuestions = await AdminPersonaQuestionService.getRelatedQuestions(
        //   adminPersonaType, 
        //   questionContext.userMessage, 
        //   3
        // );
        // referenceQuestions.push(...relatedQuestions.map(q => q.questionText));
        
      } catch (error) {
        console.error('참고 질문 수집 중 오류:', error);
      }
    } else {
      try {
        // 일반 사용자용 질문 참고 자료 수집
        const recentQuestionIds = await getRecentQuestions(session.user.id, 24);
        const nextQuestion = await getNextQuestion(userProfile, message, aiPersona);
        
        if (nextQuestion && nextQuestion.id && !recentQuestionIds.includes(nextQuestion.id)) {
          const questionText = 'question' in nextQuestion ? nextQuestion.question : nextQuestion.content?.mainQuestion;
          if (questionText) {
            referenceQuestions.push(questionText);
          }
        }
      } catch (error) {
        console.error('일반 질문 참고 자료 수집 중 오류:', error);
      }
    }

    // 📝 시스템 프롬프트 생성 (referenceQuestions 수집 후)
    let systemPrompt;
    if (isAdminUser) {
      systemPrompt = generateAdminSystemPrompt(personalizationContext, adminPersonaType, referenceQuestions);
    } else {
      systemPrompt = generatePersonalizedPrompt(personalizationContext);
      
      // 일반 사용자용 참고 질문 추가
      if (referenceQuestions.length > 0) {
        systemPrompt += `\n\n# 💡 참고할 수 있는 질문들\n`;
        systemPrompt += `다음 질문들을 참고하여 적절한 타이밍에 자연스럽게 대화에 포함시킬 수 있습니다:\n`;
        referenceQuestions.forEach((q, i) => {
          systemPrompt += `${i + 1}. ${q}\n`;
        });
        systemPrompt += `\n⚠️ 중요: 위 질문들을 강제로 모두 사용하지 마세요. 대화 맥락에 맞을 때만 자연스럽게 포함시키거나 변형해서 사용하세요.`;
      }
    }
    
    // 대화 컨텍스트를 시스템 프롬프트에 추가
    if (conversationContext.conversationLength > 2) {
      systemPrompt += `\n\n# 🔄 대화 컨텍스트 정보\n`;
      systemPrompt += `- 현재 주제: ${conversationContext.currentTopic}\n`;
      systemPrompt += `- 사용자 의도: ${conversationContext.userIntent}\n`;
      systemPrompt += `- 대화 길이: ${conversationContext.conversationLength}회\n`;
      
      // 이전 질문들 목록 추가 (반복 방지용)
      const previousQuestions = recentMessages
        .filter(m => m.content?.includes('?'))
        .map(m => m.content || '')
        .slice(-3);
      
      if (previousQuestions.length > 0) {
        systemPrompt += `- 최근 질문들: ${previousQuestions.join(' | ')}\n`;
        systemPrompt += `⚠️ 위 질문들과 유사한 내용은 다시 묻지 마세요.\n`;
      }
      
      if (continuity.isFollowUp) {
        systemPrompt += `- 이어지는 대화입니다. 이전 맥락을 고려하여 응답하세요.\n`;
      }
      
      if (continuity.topicShift) {
        systemPrompt += `- 주제가 변경되었습니다. 새로운 주제에 집중하세요.\n`;
      }
    }

    // Claude API 호출 (시스템 프롬프트 생성 후)
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.7,
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
    
    // 🐛 디버그 정보 수집
    const debugInfo = {
      systemPrompt: systemPrompt,
      promptSources: {
        userProfile: {
          businessType: userProfile.businessType,
          completionLevel: userProfile.completionLevel,
          targetAudience: userProfile.targetAudience,
          businessGoals: userProfile.businessGoals
        },
        conversationContext: {
          currentTopic: conversationContext.currentTopic,
          userIntent: conversationContext.userIntent,
          conversationLength: conversationContext.conversationLength,
          userSentiment: conversationContext.userSentiment
        },
        referenceQuestions: referenceQuestions,
        adminInfo: isAdminUser ? {
          isAdmin: true,
          personaType: adminPersonaType,
          email: session.user.email
        } : null,
        personaInfo: {
          currentPersona: aiPersona,
          personaDetails: null // 페르소나 상세 정보는 프론트엔드에서 관리
        }
      },
      responseMetadata: {
        model: 'claude-3-5-sonnet-20241022',
        qualityScore: qualityCheck?.score || null,
        personalizedEngineUsed: personalizedResult?.confidenceScore > 60 ? 'yes' : 'no',
        personalizedConfidence: personalizedResult?.confidenceScore || null,
        responseLength: finalResponse.length,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json({
      response: finalResponse,
      messageId: aiMessage.id,
      persona: aiPersona || 'general',
      debugInfo: debugInfo
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 🗑️ 더 이상 사용되지 않는 하드코딩된 질문 생성 함수 (Claude가 대신 처리)

// Admin 전용 시스템 프롬프트 생성 함수
function generateAdminSystemPrompt(
  personalizationContext: PersonalizationContext, 
  adminPersonaType: 'moment.ryan' | 'atozit',
  referenceQuestions: string[] = []
): string {
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

  let prompt = `# ${basePersonaInfo.name} - 자연스러운 페르소나 상담 AI

## 🎯 핵심 역할
당신은 ${basePersonaInfo.name}이 되어 동료 전문가와 자연스럽게 대화합니다. 
상대방도 ${basePersonaInfo.name} 본인이므로, 페르소나 고도화를 위한 전문적이고 심층적인 대화를 나누어야 합니다.

## 🎭 ${basePersonaInfo.name} 페르소나 정보
- **역할**: ${basePersonaInfo.role}
- **전문분야**: ${basePersonaInfo.expertise}
${adminPersonaType === 'moment.ryan' ? `- **영향력**: ${basePersonaInfo.followers}` : ''}
- **접근방식**: ${basePersonaInfo.approach}
${adminPersonaType === 'atozit' ? `- **중점영역**: ${basePersonaInfo.focus}` : ''}

## 💬 대화 원칙
1. **자연스러운 전문가 대화**: 억지로 질문을 끝에 붙이지 말고, 대화 흐름에 따라 자연스럽게 진행
2. **페르소나 관점 공유**: ${basePersonaInfo.name}의 시각에서 통찰과 경험을 나누며 대화
3. **심층적 탐구**: 필요할 때만 상대방의 전문성과 철학을 더 깊이 탐구하는 질문
4. **맥락적 대화**: 이전 대화를 고려하여 자연스럽게 이어가기

## ⚠️ 중요한 주의사항
- **반복적인 질문 금지**: 매번 같은 패턴의 질문을 끝에 붙이지 마세요
- **자연스러운 흐름**: 대화가 완결되면 질문 없이 끝내도 됩니다
- **맥락 고려**: 이미 답변된 내용은 다시 묻지 마세요
- **페르소나 일관성**: ${basePersonaInfo.name}의 정체성에 맞는 대화만 하세요
- **반복 방지**: 같은 주제나 비슷한 표현을 계속 사용하지 마세요
- **진정한 대화**: 로봇처럼 정형화된 응답보다는 자연스러운 전문가 대화를 하세요`;

  // 참고 질문들이 있을 경우에만 추가
  if (referenceQuestions.length > 0) {
    prompt += `\n\n## 💡 참고할 수 있는 질문 주제들
다음은 페르소나 강화에 도움될 수 있는 질문 예시들입니다. 대화 맥락에 맞을 때만 자연스럽게 활용하세요:

`;
    referenceQuestions.forEach((q, i) => {
      prompt += `${i + 1}. ${q}\n`;
    });
    
    prompt += `\n🚨 중요: 이 질문들을 모두 사용하거나 강제로 넣을 필요 없습니다. 대화가 자연스럽게 흘러갈 때만 참고하세요.`;
  }

  prompt += `\n\n현재 사용자 메시지: "${personalizationContext.userMessage}"

${basePersonaInfo.name}의 관점에서 위 메시지에 자연스럽고 전문적으로 응답하세요. 필요할 때만 페르소나 강화를 위한 질문을 포함하세요.`;

  return prompt;
}