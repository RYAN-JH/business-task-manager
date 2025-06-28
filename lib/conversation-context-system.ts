// 대화 컨텍스트 분석 시스템
import { UserProfile } from '@/lib/question-system';

export interface ConversationMessage {
  id: string;
  type: 'USER' | 'AI';
  content: string;
  persona?: string;
  createdAt: Date;
}

export interface ConversationContext {
  currentTopic: string;
  conversationFlow: string[];
  userIntent: string;
  previousQuestions: string[];
  userSentiment: 'positive' | 'neutral' | 'negative';
  conversationLength: number;
  isFirstTime: boolean;
}

// 대화 컨텍스트 분석
export function analyzeConversationContext(
  messages: ConversationMessage[],
  userProfile: UserProfile
): ConversationContext {
  const userMessages = messages.filter(m => m.type === 'USER');
  const aiMessages = messages.filter(m => m.type === 'AI');

  return {
    currentTopic: extractCurrentTopic(messages),
    conversationFlow: analyzeConversationFlow(messages),
    userIntent: inferUserIntent(userMessages),
    previousQuestions: extractPreviousQuestions(aiMessages),
    userSentiment: analyzeSentiment(userMessages),
    conversationLength: messages.length,
    isFirstTime: messages.length <= 2
  };
}

// 현재 주제 추출
function extractCurrentTopic(messages: ConversationMessage[]): string {
  const recentUserMessages = messages
    .filter(m => m.type === 'USER')
    .slice(-3)
    .map(m => m.content.toLowerCase())
    .join(' ');

  const topicKeywords = {
    '브랜딩': ['브랜딩', '브랜드', '포지셔닝', '차별화', '경쟁', '아이덴티티'],
    '콘텐츠': ['콘텐츠', '컨텐츠', '포스팅', '게시물', '글', '영상', '사진'],
    'Threads': ['threads', '쓰레드', '텍스트', '커뮤니티', '대화'],
    'Instagram': ['instagram', '인스타', '릴스', '스토리', '피드'],
    '마케팅': ['마케팅', '광고', '프로모션', '홍보', '캠페인'],
    '전략': ['전략', '계획', '방향', '목표', '로드맵'],
    '고객': ['고객', '타겟', '소비자', '구매자', '클라이언트'],
    '성장': ['성장', '확장', '증가', '발전', '개선'],
    '분석': ['분석', '데이터', '지표', '성과', '결과']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => recentUserMessages.includes(keyword))) {
      return topic;
    }
  }

  return '일반상담';
}

// 대화 흐름 분석
function analyzeConversationFlow(messages: ConversationMessage[]): string[] {
  const flow: string[] = [];
  const topics = messages.map(m => extractTopicFromMessage(m.content));
  
  // 연속된 같은 주제는 하나로 합치기
  let currentTopic = '';
  for (const topic of topics) {
    if (topic !== currentTopic && topic !== '기타') {
      flow.push(topic);
      currentTopic = topic;
    }
  }

  return flow;
}

// 메시지에서 주제 추출
function extractTopicFromMessage(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('브랜딩') || lowerContent.includes('브랜드')) return '브랜딩';
  if (lowerContent.includes('콘텐츠') || lowerContent.includes('컨텐츠')) return '콘텐츠';
  if (lowerContent.includes('threads') || lowerContent.includes('쓰레드')) return 'Threads';
  if (lowerContent.includes('instagram') || lowerContent.includes('인스타')) return 'Instagram';
  if (lowerContent.includes('마케팅')) return '마케팅';
  if (lowerContent.includes('전략')) return '전략';
  if (lowerContent.includes('고객')) return '고객';
  
  return '기타';
}

// 사용자 의도 추론
function inferUserIntent(userMessages: ConversationMessage[]): string {
  const recentMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';
  
  // 질문 의도
  if (recentMessage.includes('어떻게') || recentMessage.includes('방법') || recentMessage.includes('?')) {
    return '방법 문의';
  }
  
  // 조언 요청
  if (recentMessage.includes('조언') || recentMessage.includes('추천') || recentMessage.includes('의견')) {
    return '조언 요청';
  }
  
  // 평가 요청
  if (recentMessage.includes('어떤가') || recentMessage.includes('평가') || recentMessage.includes('생각')) {
    return '평가 요청';
  }
  
  // 문제 해결
  if (recentMessage.includes('문제') || recentMessage.includes('어려움') || recentMessage.includes('힘들')) {
    return '문제 해결';
  }
  
  // 정보 제공
  if (recentMessage.includes('알려') || recentMessage.includes('설명') || recentMessage.includes('무엇')) {
    return '정보 요청';
  }
  
  return '일반 대화';
}

// 이전 질문 추출
function extractPreviousQuestions(aiMessages: ConversationMessage[]): string[] {
  const questions: string[] = [];
  
  for (const message of aiMessages) {
    const content = message.content;
    
    // 질문 패턴 찾기
    const questionPatterns = [
      /[?？].*/g,
      /어떤.*인가요\?/g,
      /.*고 싶으신가요\?/g,
      /.*해보시는 것.*어떨까요\?/g
    ];
    
    for (const pattern of questionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        questions.push(...matches);
      }
    }
  }
  
  return questions.slice(-5); // 최근 5개만
}

// 감정 분석
function analyzeSentiment(userMessages: ConversationMessage[]): 'positive' | 'neutral' | 'negative' {
  const recentMessages = userMessages.slice(-3).map(m => m.content.toLowerCase()).join(' ');
  
  const positiveWords = ['좋', '만족', '훌륭', '최고', '감사', '도움', '효과', '성공'];
  const negativeWords = ['나쁘', '어렵', '힘들', '문제', '실패', '부족', '못하', '안되'];
  
  const positiveCount = positiveWords.filter(word => recentMessages.includes(word)).length;
  const negativeCount = negativeWords.filter(word => recentMessages.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// 컨텍스트 기반 응답 조정
export function adjustResponseForContext(
  response: string,
  context: ConversationContext,
  userProfile: UserProfile
): string {
  let adjustedResponse = response;

  // 첫 대화인 경우
  if (context.isFirstTime) {
    adjustedResponse = addWelcomeContext(adjustedResponse, userProfile);
  }

  // 연속된 같은 주제 대화인 경우
  if (context.conversationFlow.length > 0) {
    const currentTopic = context.conversationFlow[context.conversationFlow.length - 1];
    if (context.conversationFlow.filter(t => t === currentTopic).length > 2) {
      adjustedResponse = addTopicDepthContext(adjustedResponse, currentTopic);
    }
  }

  // 부정적 감정인 경우
  if (context.userSentiment === 'negative') {
    adjustedResponse = addSupportiveContext(adjustedResponse);
  }

  // 의도별 조정
  adjustedResponse = adjustResponseByIntent(adjustedResponse, context.userIntent);

  return adjustedResponse;
}

// 환영 컨텍스트 추가
function addWelcomeContext(response: string, userProfile: UserProfile): string {
  if (userProfile.businessType) {
    return `${userProfile.businessType} 사업을 운영하고 계시는군요! 👋\n\n${response}`;
  }
  return `안녕하세요! 함께 브랜드를 성장시켜나가요 👋\n\n${response}`;
}

// 주제 심화 컨텍스트 추가
function addTopicDepthContext(response: string, topic: string): string {
  const depthComments = {
    '브랜딩': '브랜딩에 대해 깊이 고민하고 계시는군요.',
    '콘텐츠': '콘텐츠 전략을 체계적으로 세우고 계시네요.',
    'Threads': 'Threads 마스터가 되시는 길이네요!',
    'Instagram': 'Instagram 전문가로 거듭나고 계시네요!',
    '마케팅': '마케팅 전략을 차근차근 다져가고 계시네요.'
  };

  const comment = depthComments[topic as keyof typeof depthComments];
  if (comment) {
    return `${comment} 더 구체적으로 도와드릴게요.\n\n${response}`;
  }
  return response;
}

// 지지적 컨텍스트 추가
function addSupportiveContext(response: string): string {
  const supportiveIntros = [
    '어려운 상황이시군요. 하지만 해결할 수 있어요!',
    '걱정 마세요. 단계별로 해결해나가면 됩니다.',
    '도전적인 상황이지만 기회로 만들 수 있어요.'
  ];
  
  const intro = supportiveIntros[Math.floor(Math.random() * supportiveIntros.length)];
  return `${intro}\n\n${response}`;
}

// 의도별 응답 조정
function adjustResponseByIntent(response: string, intent: string): string {
  const intentAdjustments = {
    '방법 문의': '구체적인 방법을 단계별로 설명드릴게요.',
    '조언 요청': '제 경험을 바탕으로 조언드리면,',
    '평가 요청': '객관적으로 평가해드리자면,',
    '문제 해결': '이 문제를 해결하는 방법은 다음과 같아요.',
    '정보 요청': '관련 정보를 정리해서 알려드릴게요.'
  };

  const adjustment = intentAdjustments[intent as keyof typeof intentAdjustments];
  if (adjustment && !response.includes(adjustment)) {
    return `${adjustment}\n\n${response}`;
  }

  return response;
}

// 대화 연속성 체크
export function checkConversationContinuity(
  messages: ConversationMessage[]
): {
  isFollowUp: boolean;
  previousContext: string;
  topicShift: boolean;
} {
  if (messages.length < 4) {
    return { isFollowUp: false, previousContext: '', topicShift: false };
  }

  const lastUserMsg = messages.filter(m => m.type === 'USER').slice(-2);
  const lastAiMsg = messages.filter(m => m.type === 'AI').slice(-1)[0];

  if (lastUserMsg.length < 2) {
    return { isFollowUp: false, previousContext: '', topicShift: false };
  }

  const currentTopic = extractTopicFromMessage(lastUserMsg[1].content);
  const previousTopic = extractTopicFromMessage(lastUserMsg[0].content);
  
  return {
    isFollowUp: true,
    previousContext: lastAiMsg?.content.substring(0, 100) || '',
    topicShift: currentTopic !== previousTopic
  };
}