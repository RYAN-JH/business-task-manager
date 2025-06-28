// 사용자 정보 수집을 위한 질문 시스템 - QuestionService로 전환

import { QuestionService, Question } from './question-service';

export interface UserProfile {
  // 최우선 정보 (우선순위 1)
  businessType?: string;
  targetCustomer?: string;
  mainProducts?: string;
  currentChallenges?: string[];
  
  // 중요 정보 (우선순위 2)
  industry?: string;
  companySize?: string;
  experienceLevel?: string;
  preferredPersona?: string;
  
  // 보조 정보 (우선순위 3)
  communicationStyle?: string;
  responseLength?: string;
  brandVoice?: string;
  competitiveAdvantage?: string;
  brandValues?: string[];
  
  // 메타 정보
  lastUpdated?: string;
  completionLevel?: number;
}

// 레거시 호환을 위한 인터페이스
export interface QuestionTemplate {
  id: string;
  priority: 1 | 2 | 3;
  field: keyof UserProfile;
  persona: 'general' | 'branding' | 'content';
  question: string;
  followUp?: string[];
  triggers?: string[]; // 이 단어들이 나오면 해당 질문 우선순위 높임
}

// QuestionService 기반 함수들로 대체

// 레거시 호환을 위한 동기 함수 (deprecated)
export const questionTemplates: QuestionTemplate[] = [
  // 기본 질문들 (하드코딩 유지 - 레거시 호환용)
  {
    id: 'business_type',
    priority: 1,
    field: 'businessType',
    persona: 'general',
    question: '어떤 종류의 사업을 운영하고 계신가요?',
    triggers: ['사업', '회사', '서비스', '제품', '창업']
  }
];

// 사용자 프로필 완성도 계산
export function calculateCompletionLevel(profile: UserProfile): number {
  const priority1Fields = ['businessType', 'targetCustomer', 'mainProducts', 'currentChallenges'];
  const priority2Fields = ['industry', 'companySize', 'experienceLevel', 'preferredPersona'];
  const priority3Fields = ['communicationStyle', 'brandVoice', 'competitiveAdvantage'];
  
  const priority1Complete = priority1Fields.filter(field => profile[field as keyof UserProfile]).length;
  const priority2Complete = priority2Fields.filter(field => profile[field as keyof UserProfile]).length;
  const priority3Complete = priority3Fields.filter(field => profile[field as keyof UserProfile]).length;
  
  // 가중치: 우선순위 1 (50%), 우선순위 2 (30%), 우선순위 3 (20%)
  const totalScore = (priority1Complete / priority1Fields.length) * 50 +
                    (priority2Complete / priority2Fields.length) * 30 +
                    (priority3Complete / priority3Fields.length) * 20;
  
  return Math.round(totalScore);
}

// QuestionService 기반 함수들

// 다음 질문 선택 로직 (async로 전환)
export async function getNextQuestion(
  profile: UserProfile, 
  userMessage: string, 
  currentPersona: string
): Promise<Question | null> {
  console.warn('⚠️ getNextQuestion은 deprecated입니다. QuestionService.selectBestQuestion을 사용하세요.');
  
  try {
    return await QuestionService.selectBestQuestion({
      recentMessages: [userMessage],
      userProfile: profile,
      sessionLength: 1,
      persona: currentPersona
    });
  } catch (error) {
    console.error('질문 선택 실패:', error);
    return null;
  }
}

// 레거시 동기 버전 (하드코딩 기반)
export function getNextQuestionSync(
  profile: UserProfile, 
  userMessage: string, 
  currentPersona: string
): QuestionTemplate | null {
  console.warn('⚠️ getNextQuestionSync는 deprecated입니다. 비동기 버전을 사용하세요.');
  
  const completionLevel = calculateCompletionLevel(profile);
  const priority1Complete = ['businessType', 'targetCustomer', 'mainProducts', 'currentChallenges']
    .every(field => profile[field as keyof UserProfile]);
  
  if (!priority1Complete && questionTemplates.length > 0) {
    return questionTemplates[0]; // 기본 질문 반환
  }
  
  return null;
}

// 사용자 프로필 업데이트
export function updateProfileFromResponse(
  profile: UserProfile,
  question: QuestionTemplate,
  response: string
): UserProfile {
  const updatedProfile = { ...profile };
  
  // 응답 정제 (전처리)
  const cleanResponse = response.trim();
  
  // 응답 길이 검증 (너무 짧거나 무의미한 응답 필터링)
  if (cleanResponse.length < 2 || 
      ['네', '아니오', '모름', '잘 모르겠어요', '없어요'].includes(cleanResponse)) {
    return updatedProfile; // 업데이트하지 않음
  }
  
  switch (question.field) {
    case 'businessType':
      updatedProfile.businessType = extractBusinessType(cleanResponse);
      break;
    case 'targetCustomer':
      updatedProfile.targetCustomer = cleanResponse;
      break;
    case 'mainProducts':
      updatedProfile.mainProducts = cleanResponse;
      break;
    case 'currentChallenges':
      updatedProfile.currentChallenges = extractChallenges(cleanResponse);
      break;
    case 'industry':
      updatedProfile.industry = extractIndustry(cleanResponse);
      break;
    case 'companySize':
      updatedProfile.companySize = extractCompanySize(cleanResponse);
      break;
    case 'experienceLevel':
      updatedProfile.experienceLevel = extractExperienceLevel(cleanResponse);
      break;
    case 'preferredPersona':
      updatedProfile.preferredPersona = extractPreferredPersona(cleanResponse);
      break;
    case 'communicationStyle':
      updatedProfile.communicationStyle = extractCommunicationStyle(cleanResponse);
      break;
    case 'brandVoice':
      updatedProfile.brandVoice = cleanResponse;
      break;
    case 'competitiveAdvantage':
      updatedProfile.competitiveAdvantage = cleanResponse;
      break;
  }
  
  updatedProfile.lastUpdated = new Date().toISOString();
  updatedProfile.completionLevel = calculateCompletionLevel(updatedProfile);
  
  return updatedProfile;
}

// 비즈니스 타입 추출
function extractBusinessType(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  // 일반적인 비즈니스 타입 키워드 매칭
  const businessTypes: { [key: string]: string[] } = {
    '온라인 쇼핑몰': ['쇼핑몰', '이커머스', '온라인 쇼핑', '판매'],
    '카페': ['카페', '커피', '디저트'],
    '레스토랑': ['레스토랑', '식당', '음식점', '요리'],
    'SaaS': ['saas', '소프트웨어', '앱', '플랫폼'],
    '컨설팅': ['컨설팅', '상담', '자문'],
    '미용': ['미용', '뷰티', '화장품', '헤어'],
    '교육': ['교육', '학원', '강의', '튜터링'],
    '제조업': ['제조', '생산', '공장'],
    '서비스업': ['서비스', '수리', '청소', '배달']
  };
  
  for (const [type, keywords] of Object.entries(businessTypes)) {
    if (keywords.some((keyword: string) => lowerResponse.includes(keyword))) {
      return type;
    }
  }
  
  return response; // 매칭되지 않으면 원본 응답 반환
}

// 도전과제 추출
function extractChallenges(response: string): string[] {
  // 쉼표, 세미콜론, '그리고', '또한' 등으로 분리
  const separators = /[,;]\s*|\s+그리고\s+|\s+또한\s+|\s+그런데\s+/;
  const challenges = response.split(separators)
    .map(challenge => challenge.trim())
    .filter(challenge => challenge.length > 2);
  
  return challenges.length > 0 ? challenges : [response];
}

// 업종 추출
function extractIndustry(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  const industries: { [key: string]: string[] } = {
    'IT': ['it', '소프트웨어', '개발', '프로그래밍', '앱', '웹'],
    '패션': ['패션', '의류', '옷', '악세사리'],
    'F&B': ['식음료', '음식', '카페', '레스토랑', '요리'],
    '뷰티': ['뷰티', '화장품', '미용', '코스메틱'],
    '교육': ['교육', '학원', '강의', '학습'],
    '제조업': ['제조', '생산', '공장', '자동차'],
    '부동산': ['부동산', '집', '아파트', '건물'],
    '의료': ['의료', '병원', '약국', '건강'],
    '금융': ['금융', '은행', '투자', '보험']
  };
  
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some((keyword: string) => lowerResponse.includes(keyword))) {
      return industry;
    }
  }
  
  return response;
}

// 회사 규모 추출
function extractCompanySize(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('1인') || lowerResponse.includes('개인')) return '1인 사업자';
  if (lowerResponse.includes('소규모') || /[2-9]명/.test(response)) return '소규모 (2-9명)';
  if (lowerResponse.includes('중소') || /1[0-9]명/.test(response) || /[2-4][0-9]명/.test(response)) return '중소기업 (10-49명)';
  if (lowerResponse.includes('중견') || /5[0-9]명/.test(response) || /[1-2][0-9][0-9]명/.test(response)) return '중견기업 (50-299명)';
  if (lowerResponse.includes('대기업') || /[3-9][0-9][0-9]명/.test(response)) return '대기업 (300명 이상)';
  
  return response;
}

// 경험 수준 추출
function extractExperienceLevel(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('초보') || lowerResponse.includes('처음') || lowerResponse.includes('신입')) return '초보자';
  if (lowerResponse.includes('중급') || /[2-4]년/.test(response)) return '중급자';
  if (lowerResponse.includes('고급') || lowerResponse.includes('전문') || /[5-9]년/.test(response)) return '고급자';
  if (lowerResponse.includes('전문가') || /1[0-9]년/.test(response) || lowerResponse.includes('베테랑')) return '전문가';
  
  return response;
}

// 선호 페르소나 추출
function extractPreferredPersona(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('브랜딩') || lowerResponse.includes('브랜드')) return 'branding';
  if (lowerResponse.includes('콘텐츠') || lowerResponse.includes('컨텐츠')) return 'content';
  if (lowerResponse.includes('종합') || lowerResponse.includes('전체') || lowerResponse.includes('통합')) return 'general';
  
  return 'general'; // 기본값
}

// 소통 스타일 추출
function extractCommunicationStyle(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('친근') || lowerResponse.includes('캐주얼')) return '친근한 톤';
  if (lowerResponse.includes('전문적') || lowerResponse.includes('격식')) return '전문적인 톤';
  if (lowerResponse.includes('간결') || lowerResponse.includes('짧게')) return '간결한 답변';
  if (lowerResponse.includes('상세') || lowerResponse.includes('자세')) return '상세한 설명';
  
  return response;
}

// 질문을 자연스럽게 응답에 포함시키는 헬퍼
export function appendQuestionToResponse(response: string, question: QuestionTemplate | Question): string {
  const questionIntros = [
    '참고로',
    '그런데', 
    '한 가지 더 궁금한 점이 있는데',
    '추가로',
    '도움이 더 필요하시다면',
    '더 정확한 조언을 위해',
  ];
  
  const intro = questionIntros[Math.floor(Math.random() * questionIntros.length)];
  
  // QuestionTemplate과 Question 타입 모두 지원
  const questionText = 'question' in question ? question.question : question.content.mainQuestion;
  
  if (!questionText) {
    console.warn('⚠️ 질문 텍스트가 없습니다:', question);
    return response;
  }
  
  return `${response}\n\n${intro}, ${questionText}`;
}