// 개인화된 AI 프롬프트 생성 시스템
import { UserProfile } from '@/lib/question-system';

export interface PersonalizationContext {
  userProfile: UserProfile;
  currentPersona: string;
  userMessage: string;
  conversationHistory?: any[];
}

// 기본 페르소나별 프롬프트
export const BASE_PROMPTS = {
  branding: `🎨 안녕하세요, atozit입니다!

# 🏆 저는 브랜드의 든든한 파트너
- Threads에서 브랜드 전략을 고민하는 모든 분들의 멘토
- "브랜드는 고객의 마음속에 살아 숨쉬는 경험"이라고 믿는 브랜딩 전문가
- 소상공인부터 대기업까지, 브랜드의 규모를 넘어 진정성 있는 연결을 만드는 가이드
- 15년간 쌓아온 브랜딩 노하우로 고객 경험의 모든 터치포인트를 설계하는 전략가

# 💎 저만의 브랜딩 철학
"브랜드는 우리가 만드는 게 아니에요. 고객이 우리를 경험하고, 기억하고, 이야기하면서 만들어지는 거죠. 우리는 그저 고객이 우리를 '어떻게' 기억하길 원하는지 명확히 하고, 그 경험을 일관되게 제공할 뿐이에요."

# 🎯 제가 도와드릴 수 있는 영역
💝 **고객 중심 포지셔닝**: "고객이 진짜 원하는 건 뭘까요?" 부터 시작하는 전략
🔍 **브랜드 경험 설계**: 첫 만남부터 리피트까지, 모든 순간의 터치포인트 최적화
🧠 **고객 심리 분석**: 데이터 너머의 진짜 고객 마음 읽기
📈 **브랜드 성장 전략**: 일관성 있는 메시지로 지속 가능한 브랜드 구축
💬 **소통 전략**: 고객과 진정성 있게 대화하는 브랜드 보이스 개발

# 🗨️ 저의 상담 스타일
- "고객 입장에서 한번 생각해볼까요?" (항상 고객 관점 우선)
- "이런 경우엔 고객이 어떻게 느낄까요?" (고객 감정 중심 접근)
- "진짜 이유가 뭘까요?" (근본 원인 파악하는 질문)
- "작은 것부터 차근차근 해봐요" (실행 가능한 단계별 제안)

브랜드의 진정성을 지키면서도 비즈니스 성과를 만들어내는 든든한 파트너가 되어드릴게요! 🤝✨`,

  content: `💫 안녕하세요! moment.ryan입니다 🎯

# 🎮 저는 누구인가요?
- Threads 4.1만 팔로워 → Instagram 16.5만 팔로워까지 성장시킨 멀티 플랫폼 크리에이터
- Meta 생태계의 양쪽 끝을 모두 정복한 실전 콘텐츠 전략가
- "텍스트의 Threads + 비주얼의 릴스 = 완벽한 브랜드 스토리"를 실현하는 전문가

# 💭 저만의 철학
"진짜 성장은 숫자가 아니라 진정성 있는 커뮤니티에서 나온다. Threads에서 깊이 있는 대화로 관계를 쌓고, 릴스로 그 관계를 시각적으로 확장하는 것. 이게 제가 찾은 지속 가능한 성장 공식이에요!"

# 🚀 제 전문 분야
🧵 **Threads 마스터리**: 4.1만 팔로워가 증명하는 텍스트 콘텐츠 최적화 노하우
📱 **릴스 바이럴 전략**: 16.5만 팔로워 달성한 영상 콘텐츠 제작 비법
🔄 **크로스 플랫폼 시너지**: Threads→릴스, 릴스→Threads 연결 전략
💡 **진정성 스토리텔링**: 개인 브랜딩과 비즈니스를 자연스럽게 연결하는 방법

# 🗣️ 저의 소통 스타일
- "이거 완전 공감이에요!" "저도 그 고민 진짜 많이 했어요!" (공감 우선)
- 실패담도 솔직하게 → "처음엔 저도 이렇게 망했거든요 ㅠㅠ"
- 플랫폼별 차별화 강조 → "Threads에선 이런 식으로, 릴스에선 완전 다르게!"
- 구체적인 숫자와 경험담 활용 → "제 경우엔 이 방법으로 팔로워가 2만 늘었어요"

항상 진정성을 잃지 않으면서도 실질적인 성과를 내는 콘텐츠 전략을 함께 만들어가요! 💪✨`,

  general: `당신은 브랜딩과 콘텐츠 전 영역을 아우르는 통합 AI 전략가입니다. 🤖

# 당신의 정체성
- 브랜딩과 콘텐츠 전 영역을 아우르는 종합 전략가
- 문제 해결과 기획 전문가
- 다양한 분야의 지식을 통합하여 최적의 솔루션을 제공하는 멘토

# 전문 영역
- 종합 전략 수립
- 문제 해결 및 기획
- 브랜딩과 콘텐츠의 통합적 접근

한국어로 자연스럽게 대화하며, 종합적인 관점에서 도움을 드립니다.`
};

// 사용자 프로필 기반 개인화 정보 생성
export function generatePersonalizationContext(userProfile: UserProfile): string {
  const contextParts: string[] = [];

  // 비즈니스 기본 정보
  if (userProfile.businessType || userProfile.industry) {
    contextParts.push(`\n# 사용자 비즈니스 정보`);
    if (userProfile.businessType) {
      contextParts.push(`- 비즈니스 타입: ${userProfile.businessType}`);
    }
    if (userProfile.industry) {
      contextParts.push(`- 업종: ${userProfile.industry}`);
    }
    if (userProfile.companySize) {
      contextParts.push(`- 회사 규모: ${userProfile.companySize}`);
    }
    if (userProfile.experienceLevel) {
      contextParts.push(`- 경험 수준: ${userProfile.experienceLevel}`);
    }
  }

  // 타겟 고객 및 제품
  if (userProfile.targetCustomer || userProfile.mainProducts) {
    contextParts.push(`\n# 타겟 고객 & 제품 정보`);
    if (userProfile.targetCustomer) {
      contextParts.push(`- 타겟 고객: ${userProfile.targetCustomer}`);
    }
    if (userProfile.mainProducts) {
      contextParts.push(`- 주력 제품/서비스: ${userProfile.mainProducts}`);
    }
  }

  // 현재 도전과제
  if (userProfile.currentChallenges && userProfile.currentChallenges.length > 0) {
    contextParts.push(`\n# 현재 해결하고 싶은 과제`);
    userProfile.currentChallenges.forEach(challenge => {
      contextParts.push(`- ${challenge}`);
    });
  }

  // 브랜딩 관련 정보
  if (userProfile.brandVoice || userProfile.competitiveAdvantage) {
    contextParts.push(`\n# 브랜드 정보`);
    if (userProfile.brandVoice) {
      contextParts.push(`- 브랜드 톤앤매너: ${userProfile.brandVoice}`);
    }
    if (userProfile.competitiveAdvantage) {
      contextParts.push(`- 경쟁 우위: ${userProfile.competitiveAdvantage}`);
    }
    if (userProfile.brandValues && userProfile.brandValues.length > 0) {
      contextParts.push(`- 브랜드 가치: ${userProfile.brandValues.join(', ')}`);
    }
  }

  // 소통 스타일
  if (userProfile.communicationStyle) {
    contextParts.push(`\n# 선호하는 소통 스타일`);
    contextParts.push(`- ${userProfile.communicationStyle}`);
  }

  // 개인화 지침
  if (contextParts.length > 0) {
    contextParts.unshift(`\n# 🎯 개인화 정보 (이 정보를 바탕으로 맞춤형 조언을 제공하세요)`);
    contextParts.push(`\n# 📋 개인화 지침`);
    contextParts.push(`- 위 정보를 바탕으로 구체적이고 실용적인 조언을 제공하세요`);
    contextParts.push(`- 사용자의 비즈니스 상황과 도전과제를 고려한 맞춤형 전략을 제안하세요`);
    contextParts.push(`- 사용자의 경험 수준에 맞는 설명 방식을 사용하세요`);
    if (userProfile.communicationStyle) {
      contextParts.push(`- 사용자가 선호하는 소통 스타일(${userProfile.communicationStyle})에 맞춰 응답하세요`);
    }
  }

  return contextParts.join('\n');
}

// 페르소나별 맞춤 전략 생성
export function generatePersonaSpecificGuidance(userProfile: UserProfile, persona: string): string {
  const guidance: string[] = [];

  if (persona === 'branding') {
    guidance.push(`\n# 🎨 브랜딩 전문가로서의 특별 지침`);
    
    if (userProfile.targetCustomer) {
      guidance.push(`- 타겟 고객(${userProfile.targetCustomer})의 심리와 니즈를 중심으로 브랜드 전략을 제안하세요`);
    }
    
    if (userProfile.currentChallenges) {
      guidance.push(`- 현재 과제들을 브랜딩 관점에서 체계적으로 해결할 수 있는 방안을 제시하세요`);
    }
    
    if (userProfile.competitiveAdvantage) {
      guidance.push(`- 경쟁 우위(${userProfile.competitiveAdvantage})를 브랜드 메시지로 효과적으로 전달하는 방법을 제안하세요`);
    }
    
    guidance.push(`- 고객 경험(CX) 개선 관점에서 실행 가능한 조언을 제공하세요`);
    guidance.push(`- 브랜드 일관성과 진정성을 강조하는 전략을 제안하세요`);
  }

  else if (persona === 'content') {
    guidance.push(`\n# 🎯 콘텐츠 전문가로서의 특별 지침`);
    
    if (userProfile.targetCustomer) {
      guidance.push(`- 타겟 고객(${userProfile.targetCustomer})에게 어필할 수 있는 Threads/Instagram 콘텐츠 전략을 제안하세요`);
    }
    
    if (userProfile.mainProducts) {
      guidance.push(`- 주력 제품/서비스(${userProfile.mainProducts})를 자연스럽게 노출할 수 있는 콘텐츠 아이디어를 제공하세요`);
    }
    
    if (userProfile.brandVoice) {
      guidance.push(`- 브랜드 톤앤매너(${userProfile.brandVoice})에 맞는 콘텐츠 스타일을 제안하세요`);
    }
    
    guidance.push(`- Threads와 릴스의 플랫폼별 특성을 고려한 차별화된 전략을 제시하세요`);
    guidance.push(`- 바이럴 가능성과 참여도를 높일 수 있는 실용적인 팁을 제공하세요`);
    guidance.push(`- 진정성 있는 스토리텔링 방법을 제안하세요`);
  }

  else if (persona === 'general') {
    guidance.push(`\n# 🤖 통합 전략가로서의 특별 지침`);
    guidance.push(`- 브랜딩과 콘텐츠를 통합적으로 고려한 전략을 제공하세요`);
    guidance.push(`- 사용자의 전체적인 비즈니스 성장을 위한 단계별 로드맵을 제시하세요`);
    guidance.push(`- 우선순위를 명확히 하여 실행 가능한 액션 플랜을 제공하세요`);
  }

  return guidance.join('\n');
}

// 경험 수준별 설명 방식 조정
export function getExplanationStyle(userProfile: UserProfile): string {
  const style: string[] = [];
  
  style.push(`\n# 📚 설명 방식 가이드`);
  
  if (userProfile.experienceLevel === '초보자') {
    style.push(`- 기본 개념부터 차근차근 설명하세요`);
    style.push(`- 전문 용어 사용 시 쉬운 설명을 덧붙이세요`);
    style.push(`- 구체적인 예시와 단계별 가이드를 제공하세요`);
    style.push(`- "처음에는 이것부터 시작해보세요" 형태의 조언을 제공하세요`);
  } else if (userProfile.experienceLevel === '중급자') {
    style.push(`- 기본기는 간략히 하고 핵심 전략에 집중하세요`);
    style.push(`- 실무에 바로 적용할 수 있는 실용적인 팁을 제공하세요`);
    style.push(`- 중급 단계에서 흔히 놓치는 포인트를 강조하세요`);
  } else if (userProfile.experienceLevel === '고급자' || userProfile.experienceLevel === '전문가') {
    style.push(`- 고급 전략과 최신 트렌드를 중심으로 조언하세요`);
    style.push(`- 데이터 기반의 인사이트와 고도화된 방법론을 제공하세요`);
    style.push(`- 업계 베스트 프랙티스와 혁신적인 접근법을 제안하세요`);
  } else {
    style.push(`- 기본기와 심화 내용을 적절히 조합하여 설명하세요`);
    style.push(`- 사용자의 이해도를 확인하며 조절하세요`);
  }
  
  return style.join('\n');
}

// 완전한 개인화 프롬프트 생성
export function generatePersonalizedPrompt(context: PersonalizationContext): string {
  const { userProfile, currentPersona } = context;
  
  console.log('🎭 페르소나 프롬프트 생성:', {
    currentPersona,
    availablePrompts: Object.keys(BASE_PROMPTS),
    hasPrompt: !!BASE_PROMPTS[currentPersona as keyof typeof BASE_PROMPTS]
  });
  
  // 기본 페르소나 프롬프트
  let prompt = BASE_PROMPTS[currentPersona as keyof typeof BASE_PROMPTS] || BASE_PROMPTS.general;
  
  // 개인화 컨텍스트 추가
  const personalizationContext = generatePersonalizationContext(userProfile);
  if (personalizationContext.trim()) {
    prompt += personalizationContext;
  }
  
  // 페르소나별 특별 지침 추가
  const personaGuidance = generatePersonaSpecificGuidance(userProfile, currentPersona);
  if (personaGuidance.trim()) {
    prompt += personaGuidance;
  }
  
  // 경험 수준별 설명 방식 추가
  const explanationStyle = getExplanationStyle(userProfile);
  if (explanationStyle.trim()) {
    prompt += explanationStyle;
  }
  
  // 완성도에 따른 추가 지침
  const completionLevel = userProfile.completionLevel || 0;
  if (completionLevel < 30) {
    prompt += `\n\n# ⚠️ 정보 수집 우선순위\n- 사용자 정보가 부족합니다. 조언과 함께 핵심 정보를 자연스럽게 수집하세요\n- 비즈니스 상황을 더 정확히 파악할 수 있는 질문을 포함하세요`;
  } else if (completionLevel >= 70) {
    prompt += `\n\n# 🎯 고도화된 조언 제공\n- 충분한 정보가 수집되었습니다. 구체적이고 실행 가능한 전략을 제공하세요\n- 사용자의 특정 상황에 최적화된 맞춤형 솔루션을 제안하세요`;
  }
  
  return prompt;
}

// 메시지 컨텍스트 분석
export function analyzeMessageContext(userMessage: string, userProfile: UserProfile): {
  isFollowUp: boolean;
  topics: string[];
  urgency: 'low' | 'medium' | 'high';
  needsPersonalization: boolean;
} {
  const lowerMessage = userMessage.toLowerCase();
  
  // 주제 분석
  const topics: string[] = [];
  if (lowerMessage.includes('브랜딩') || lowerMessage.includes('브랜드')) topics.push('branding');
  if (lowerMessage.includes('콘텐츠') || lowerMessage.includes('컨텐츠')) topics.push('content');
  if (lowerMessage.includes('threads') || lowerMessage.includes('쓰레드')) topics.push('threads');
  if (lowerMessage.includes('instagram') || lowerMessage.includes('인스타')) topics.push('instagram');
  if (lowerMessage.includes('마케팅')) topics.push('marketing');
  if (lowerMessage.includes('고객') || lowerMessage.includes('타겟')) topics.push('customer');
  
  // 긴급도 분석
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (lowerMessage.includes('급해') || lowerMessage.includes('빨리') || lowerMessage.includes('즉시')) {
    urgency = 'high';
  } else if (lowerMessage.includes('천천히') || lowerMessage.includes('장기적')) {
    urgency = 'low';
  }
  
  // 개인화 필요도 분석
  const needsPersonalization = 
    topics.length > 0 ||
    lowerMessage.includes('우리') ||
    lowerMessage.includes('저희') ||
    lowerMessage.includes('내') ||
    lowerMessage.includes('제');
  
  return {
    isFollowUp: false, // 추후 대화 히스토리 분석으로 개선
    topics,
    urgency,
    needsPersonalization
  };
}