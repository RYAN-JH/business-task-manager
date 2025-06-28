// 응답 향상 및 후처리 시스템
import { UserProfile } from '@/lib/question-system';

export interface ResponseEnhancementContext {
  userProfile: UserProfile;
  currentPersona: string;
  userMessage: string;
  aiResponse: string;
  messageTopics: string[];
}

// 페르소나별 응답 후처리
export function enhanceResponseByPersona(context: ResponseEnhancementContext): string {
  const { userProfile, currentPersona, aiResponse, messageTopics } = context;
  let enhancedResponse = aiResponse;

  // 브랜딩 전문가 응답 향상
  if (currentPersona === 'branding') {
    enhancedResponse = enhanceBrandingResponse(enhancedResponse, userProfile, messageTopics);
  }
  
  // 콘텐츠 전문가 응답 향상
  else if (currentPersona === 'content') {
    enhancedResponse = enhanceContentResponse(enhancedResponse, userProfile, messageTopics);
  }
  
  // 통합 AI 응답 향상
  else if (currentPersona === 'general') {
    enhancedResponse = enhanceGeneralResponse(enhancedResponse, userProfile, messageTopics);
  }

  return enhancedResponse;
}

// 브랜딩 전문가 응답 향상
function enhanceBrandingResponse(response: string, userProfile: UserProfile, topics: string[]): string {
  let enhanced = response;

  // 타겟 고객 관련 조언이 있는 경우 구체화
  if (topics.includes('customer') && userProfile.targetCustomer) {
    if (!enhanced.includes(userProfile.targetCustomer)) {
      enhanced += `\n\n💡 참고: 타겟 고객인 "${userProfile.targetCustomer}"의 특성을 고려하면, 위 전략을 더욱 효과적으로 적용할 수 있을 것 같아요.`;
    }
  }

  // 브랜드 차별화 포인트 강조
  if (topics.includes('branding') && userProfile.competitiveAdvantage) {
    if (!enhanced.includes(userProfile.competitiveAdvantage)) {
      enhanced += `\n\n🎯 강점 활용: "${userProfile.competitiveAdvantage}"라는 차별화 포인트를 브랜드 메시지에 더 강하게 녹여내는 것도 좋겠어요.`;
    }
  }

  // 업종별 특화 조언
  if (userProfile.industry) {
    enhanced = addIndustrySpecificBrandingAdvice(enhanced, userProfile.industry, topics);
  }

  return enhanced;
}

// 콘텐츠 전문가 응답 향상
function enhanceContentResponse(response: string, userProfile: UserProfile, topics: string[]): string {
  let enhanced = response;

  // 주력 제품/서비스와 연관된 콘텐츠 아이디어 제안
  if (topics.includes('content') && userProfile.mainProducts) {
    if (!enhanced.includes(userProfile.mainProducts)) {
      enhanced += `\n\n📱 콘텐츠 아이디어: "${userProfile.mainProducts}"와 관련해서 고객의 일상 스토리나 사용 후기를 자연스럽게 녹인 콘텐츠도 효과적일 것 같아요!`;
    }
  }

  // 플랫폼별 맞춤 전략 제안
  if (topics.includes('threads') || topics.includes('instagram')) {
    enhanced = addPlatformSpecificAdvice(enhanced, userProfile, topics);
  }

  // 타겟 고객 맞춤 콘텐츠 방향성
  if (userProfile.targetCustomer && userProfile.brandVoice) {
    enhanced += `\n\n🎨 브랜드 톤: "${userProfile.brandVoice}" 톤으로 "${userProfile.targetCustomer}" 고객층에게 어필하는 콘텐츠를 만들어보세요.`;
  }

  return enhanced;
}

// 통합 AI 응답 향상
function enhanceGeneralResponse(response: string, userProfile: UserProfile, topics: string[]): string {
  let enhanced = response;

  // 종합적인 우선순위 제안
  if (userProfile.currentChallenges && userProfile.currentChallenges.length > 0) {
    const mainChallenge = userProfile.currentChallenges[0];
    if (!enhanced.includes(mainChallenge)) {
      enhanced += `\n\n🎯 우선순위: 현재 가장 큰 과제인 "${mainChallenge}"를 해결하는 것부터 시작해보시는 것을 추천드려요.`;
    }
  }

  // 단계별 실행 계획 제안
  enhanced = addStepByStepPlan(enhanced, userProfile, topics);

  return enhanced;
}

// 업종별 브랜딩 조언 추가
function addIndustrySpecificBrandingAdvice(response: string, industry: string, topics: string[]): string {
  const industryAdvice: { [key: string]: string } = {
    'IT': '기술의 복잡함을 고객이 쉽게 이해할 수 있도록 스토리텔링하는 것이 중요해요.',
    '패션': '시각적 일관성과 브랜드 미학이 특히 중요한 업종이에요.',
    'F&B': '맛과 경험을 시각적으로 전달하는 브랜딩이 핵심이에요.',
    '뷰티': '고객의 변화와 자신감을 강조하는 브랜드 스토리가 효과적이에요.',
    '교육': '신뢰성과 전문성을 보여주는 브랜딩이 가장 중요해요.',
    '제조업': 'B2B 특성을 고려한 전문적이고 신뢰할 수 있는 브랜딩이 필요해요.',
    '의료': '안전성과 전문성을 강조하는 보수적인 브랜딩 접근이 좋아요.',
    '금융': '신뢰성과 안정성을 전달하는 브랜딩이 핵심이에요.'
  };

  if (industryAdvice[industry] && topics.includes('branding')) {
    return response + `\n\n🏢 ${industry} 업종 팁: ${industryAdvice[industry]}`;
  }

  return response;
}

// 플랫폼별 조언 추가
function addPlatformSpecificAdvice(response: string, userProfile: UserProfile, topics: string[]): string {
  let advice = '';

  if (topics.includes('threads')) {
    advice += '\n\n🧵 Threads 전략: 텍스트 중심의 진솔한 스토리와 커뮤니티 참여가 핵심이에요.';
  }

  if (topics.includes('instagram')) {
    advice += '\n\n📸 Instagram 전략: 시각적 임팩트와 릴스의 짧은 호흡이 중요해요.';
  }

  return response + advice;
}

// 단계별 실행 계획 추가
function addStepByStepPlan(response: string, userProfile: UserProfile, topics: string[]): string {
  const completionLevel = userProfile.completionLevel || 0;
  
  // 완성도가 낮은 경우 기본기부터 제안
  if (completionLevel < 50) {
    return response + `\n\n📋 다음 단계:\n1. 타겟 고객을 더 구체적으로 정의\n2. 브랜드 포지셔닝 명확화\n3. 핵심 메시지 개발\n4. 실행 전략 수립`;
  }

  // 완성도가 높은 경우 고도화 제안
  if (completionLevel >= 70) {
    return response + `\n\n🚀 고도화 방안:\n1. 데이터 기반 성과 측정\n2. A/B 테스트를 통한 최적화\n3. 고객 피드백 수집 및 분석\n4. 전략 지속적 개선`;
  }

  return response;
}

// 응답에 적절한 이모지와 구조화 추가
export function formatResponse(response: string, persona: string): string {
  let formatted = response;

  // 페르소나별 서명 추가
  const signatures = {
    branding: '\n\n---\n🎨 atozit이 고객 중심 관점에서 제안드려요',
    content: '\n\n---\n🎯 moment.ryan이 실전 경험을 바탕으로 제안드려요',
    general: '\n\n---\n🤖 통합 AI가 종합적인 관점에서 제안드려요'
  };

  // 서명 추가 (단, 이미 서명이 있는 경우 제외)
  const signature = signatures[persona as keyof typeof signatures];
  if (signature && !formatted.includes('---')) {
    formatted += signature;
  }

  return formatted;
}

// 응답 품질 검증
export function validateResponseQuality(response: string, userProfile: UserProfile): {
  isPersonalized: boolean;
  isActionable: boolean;
  isRelevant: boolean;
  score: number;
} {
  let score = 0;
  
  // 개인화 체크 (사용자 정보 포함 여부)
  const isPersonalized = Boolean(
    (userProfile.businessType && response.includes(userProfile.businessType)) ||
    (userProfile.targetCustomer && response.includes(userProfile.targetCustomer)) ||
    (userProfile.industry && response.includes(userProfile.industry))
  );
  
  if (isPersonalized) score += 30;

  // 실행 가능성 체크 (구체적인 조언 포함 여부)
  const actionKeywords = ['추천', '제안', '시작', '진행', '실행', '적용', '활용'];
  const isActionable = actionKeywords.some(keyword => response.includes(keyword));
  
  if (isActionable) score += 25;

  // 관련성 체크 (적절한 길이와 구조)
  const isRelevant = response.length > 100 && response.length < 2000;
  
  if (isRelevant) score += 20;

  // 전문성 체크 (이모지와 구조화)
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(response);
  const hasStructure = response.includes('\n') && (response.includes('•') || response.includes('-') || response.includes('1.'));
  
  if (hasEmojis) score += 15;
  if (hasStructure) score += 10;

  return {
    isPersonalized,
    isActionable,
    isRelevant,
    score
  };
}