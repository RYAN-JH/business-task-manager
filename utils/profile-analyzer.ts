import { ExtendedProfile, ProfileQuestion, ProfileAnalysis } from '../types/extended-profile';

// 프로필 분석을 위한 유틸리티 함수들

export class ProfileAnalyzer {
  
  // 프로필 완성도 계산
  static calculateCompletionPercentage(profile: ExtendedProfile): number {
    const totalFields = 50; // 전체 주요 필드 개수
    let completedFields = 0;

    // 기본 정보 확인
    if (profile.name) completedFields++;
    if (profile.email) completedFields++;
    if (profile.businessName) completedFields++;
    if (profile.businessType) completedFields++;
    if (profile.industry) completedFields++;
    if (profile.experienceLevel) completedFields++;
    if (profile.goals && profile.goals.length > 0) completedFields++;
    if (profile.challenges && profile.challenges.length > 0) completedFields++;
    if (profile.interests && profile.interests.length > 0) completedFields++;

    // 사업 운영 정보 확인
    if (profile.businessOperation?.monthlyRevenue?.range) completedFields++;
    if (profile.businessOperation?.employeeCount) completedFields++;
    if (profile.businessOperation?.operationPeriod) completedFields++;
    if (profile.businessOperation?.growthRate) completedFields++;

    // 고객 정보 확인
    if (profile.customerDetails?.ageDistribution) completedFields++;
    if (profile.customerDetails?.genderDistribution) completedFields++;
    if (profile.customerDetails?.incomeLevel) completedFields++;
    if (profile.customerDetails?.location) completedFields++;

    // 마케팅 정보 확인
    if (profile.marketing?.monthlyBudget) completedFields++;
    if (profile.marketing?.currentPlatforms) completedFields++;
    if (profile.marketing?.customerAcquisitionCost) completedFields++;

    // 브랜드 정보 확인
    if (profile.brandIdentity?.brandStory) completedFields++;
    if (profile.brandIdentity?.mission) completedFields++;
    if (profile.brandIdentity?.differentiation) completedFields++;

    // 개인적 특성 확인
    if (profile.personalCharacteristics?.personalityType) completedFields++;
    if (profile.personalCharacteristics?.communicationStyle) completedFields++;
    if (profile.personalCharacteristics?.learningStyle) completedFields++;

    // 업무 스타일 확인
    if (profile.workStyle?.peakHours) completedFields++;
    if (profile.workStyle?.workStyle) completedFields++;
    if (profile.workStyle?.collaborationPreference) completedFields++;

    // 목표 및 전략 확인
    if (profile.goalsStrategy?.businessGoals?.oneYearRevenue) completedFields++;
    if (profile.goalsStrategy?.businessGoals?.threeYearVision) completedFields++;
    if (profile.goalsStrategy?.marketingGoals?.customerGrowth) completedFields++;

    // 콘텐츠 및 소셜미디어 확인
    if (profile.contentSocialMedia?.platforms) completedFields++;
    if (profile.contentSocialMedia?.preferredFormat) completedFields++;
    if (profile.contentSocialMedia?.toneAndManner) completedFields++;

    // 전문성 및 역량 확인
    if (profile.expertiseCapability?.strengths) completedFields++;
    if (profile.expertiseCapability?.improvementAreas) completedFields++;
    if (profile.expertiseCapability?.learningGoals) completedFields++;

    // 시장 및 경쟁 환경 확인
    if (profile.marketCompetition?.marketInfo?.marketSize) completedFields++;
    if (profile.marketCompetition?.competitorAnalysis) completedFields++;

    // 성과 지표 확인
    if (profile.performanceMetrics?.kpis) completedFields++;
    if (profile.performanceMetrics?.dataUsage) completedFields++;

    // 혁신 및 기술 확인
    if (profile.innovationTechnology?.techAdoption?.openness) completedFields++;
    if (profile.innovationTechnology?.techAdoption?.currentTools) completedFields++;

    // 조직 및 팀 확인
    if (profile.organizationTeam?.teamRoles) completedFields++;
    if (profile.organizationTeam?.decisionStructure) completedFields++;

    // 고객 관계 확인
    if (profile.customerRelationship?.mainFeedback) completedFields++;
    if (profile.customerRelationship?.retentionStrategy) completedFields++;

    // 판매 및 유통 확인
    if (profile.salesDistribution?.mainChannels) completedFields++;
    if (profile.salesDistribution?.platforms) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // 누락된 필드 분석
  static analyzeMissingFields(profile: ExtendedProfile): string[] {
    const missingFields: string[] = [];

    if (!profile.name) missingFields.push('name');
    if (!profile.businessName) missingFields.push('businessName');
    if (!profile.businessType) missingFields.push('businessType');
    if (!profile.industry) missingFields.push('industry');
    
    if (!profile.businessOperation?.monthlyRevenue?.range) {
      missingFields.push('businessOperation.monthlyRevenue');
    }
    if (!profile.businessOperation?.employeeCount) {
      missingFields.push('businessOperation.employeeCount');
    }
    
    if (!profile.customerDetails?.ageDistribution) {
      missingFields.push('customerDetails.ageDistribution');
    }
    
    if (!profile.marketing?.monthlyBudget) {
      missingFields.push('marketing.monthlyBudget');
    }
    
    if (!profile.brandIdentity?.brandStory) {
      missingFields.push('brandIdentity.brandStory');
    }
    
    if (!profile.personalCharacteristics?.personalityType) {
      missingFields.push('personalCharacteristics.personalityType');
    }

    return missingFields;
  }

  // 신규 사용자 여부 판단
  static isNewUser(profile: ExtendedProfile): boolean {
    const basicFieldsCount = [
      profile.name, profile.businessName, profile.businessType, 
      profile.industry, profile.experienceLevel
    ].filter(field => field && field.trim().length > 0).length;
    
    return basicFieldsCount < 3; // 기본 정보 3개 미만이면 신규 사용자
  }

  // 사용자 온보딩 단계 판단
  static getUserOnboardingStage(profile: ExtendedProfile): 'new' | 'basic' | 'intermediate' | 'advanced' {
    const completionPercentage = this.calculateCompletionPercentage(profile);
    
    if (completionPercentage < 20) return 'new';
    if (completionPercentage < 50) return 'basic';
    if (completionPercentage < 80) return 'intermediate';
    return 'advanced';
  }

  // 우선순위 질문 생성 (신규 사용자 우대)
  static generatePriorityQuestions(profile: ExtendedProfile): ProfileQuestion[] {
    const questions: ProfileQuestion[] = [];
    const isNewUser = this.isNewUser(profile);
    const onboardingStage = this.getUserOnboardingStage(profile);
    
    // 🆕 신규 사용자를 위한 필수 온보딩 질문들 (중복 방지)
    if (isNewUser || onboardingStage === 'new') {
      if (!profile.businessName || profile.businessName.trim() === '') {
        questions.push({
          category: 'basic',
          field: 'businessName',
          question: '먼저 사업체나 브랜드 이름을 알려주시겠어요? 더 맞춤형 조언을 드릴 수 있습니다.',
          priority: 'high',
          triggerContext: ['greeting', 'introduction', 'any']
        });
      }
      
      if (!profile.industry || profile.industry.trim() === '') {
        questions.push({
          category: 'basic',
          field: 'industry',
          question: '어떤 업종에서 사업을 하고 계신지 궁금해요!',
          followUpQuestions: [
            '업종에 따라 전략이 달라지거든요.',
            '해당 분야에서 어떤 점이 가장 어려우신가요?'
          ],
          priority: 'high',
          triggerContext: ['business_discussion', 'any']
        });
      }
      
      if (!profile.businessType || profile.businessType.trim() === '') {
        questions.push({
          category: 'basic',
          field: 'businessType',
          question: '온라인 사업인가요, 오프라인 사업인가요? 아니면 둘 다인가요?',
          followUpQuestions: [
            '사업 방식에 따라 마케팅 접근법이 완전히 달라져요.',
            '현재 어떤 방식으로 고객을 만나고 계신가요?'
          ],
          priority: 'high',
          triggerContext: ['business_discussion', 'marketing_strategy', 'any']
        });
      }
    }
    
    // 기본 정보 질문들
    if (!profile.businessName && !isNewUser) {
      questions.push({
        category: 'basic',
        field: 'businessName',
        question: '사업체 이름이나 브랜드명을 알려주세요.',
        priority: 'high',
        triggerContext: ['greeting', 'introduction']
      });
    }

    if (!profile.businessOperation?.monthlyRevenue?.range) {
      questions.push({
        category: 'business',
        field: 'monthlyRevenue',
        question: '현재 월 매출 규모는 어느 정도인가요? (대략적인 구간으로 알려주셔도 됩니다)',
        followUpQuestions: [
          '매출이 최근 증가하는 추세인가요?',
          '주요 매출원은 어떤 것들인가요?'
        ],
        priority: 'high',
        triggerContext: ['business_discussion', 'growth_planning']
      });
    }

    if (!profile.customerDetails?.ageDistribution) {
      questions.push({
        category: 'customer',
        field: 'customerAge',
        question: '주요 고객층의 연령대는 어떻게 되나요?',
        followUpQuestions: [
          '어떤 연령대에서 가장 많이 구매하시나요?',
          '연령대별로 선호하는 제품이나 서비스가 다른가요?'
        ],
        priority: 'high',
        triggerContext: ['customer_analysis', 'marketing_strategy']
      });
    }

    if (!profile.brandIdentity?.brandStory) {
      questions.push({
        category: 'brand',
        field: 'brandStory',
        question: '브랜드나 사업을 시작하게 된 특별한 계기나 이야기가 있나요?',
        followUpQuestions: [
          '어떤 문제를 해결하고 싶어서 시작하셨나요?',
          '고객들에게 어떤 가치를 전달하고 싶으신가요?'
        ],
        priority: 'medium',
        triggerContext: ['brand_discussion', 'storytelling']
      });
    }

    if (!profile.marketing?.currentPlatforms || profile.marketing.currentPlatforms.length === 0) {
      questions.push({
        category: 'marketing',
        field: 'marketingPlatforms',
        question: '현재 어떤 마케팅 채널을 주로 활용하고 계신가요?',
        followUpQuestions: [
          '가장 효과적인 마케팅 채널은 무엇인가요?',
          '새로 시도해보고 싶은 마케팅 방법이 있나요?'
        ],
        priority: 'high',
        triggerContext: ['marketing_discussion', 'channel_strategy']
      });
    }

    if (!profile.personalCharacteristics?.personalityType) {
      questions.push({
        category: 'personal',
        field: 'personality',
        question: 'MBTI나 다른 성격 유형 검사를 해보신 적이 있나요? 본인의 성격을 어떻게 생각하시나요?',
        followUpQuestions: [
          '어떤 방식으로 소통하는 것을 선호하시나요?',
          '스트레스를 받을 때는 어떻게 대처하시나요?'
        ],
        priority: 'medium',
        triggerContext: ['personal_discussion', 'communication_style']
      });
    }

    if (!profile.goalsStrategy?.businessGoals?.oneYearRevenue) {
      questions.push({
        category: 'goals',
        field: 'businessGoals',
        question: '1년 후 사업 목표는 어떻게 되나요? 매출이나 성장 면에서요.',
        followUpQuestions: [
          '그 목표를 달성하기 위한 구체적인 계획이 있으신가요?',
          '가장 큰 걸림돌은 무엇이라고 생각하시나요?'
        ],
        priority: 'high',
        triggerContext: ['goal_setting', 'business_planning']
      });
    }

    if (!profile.contentSocialMedia?.platforms || profile.contentSocialMedia.platforms.length === 0) {
      questions.push({
        category: 'content',
        field: 'socialPlatforms',
        question: '소셜미디어나 온라인 플랫폼은 어떤 것들을 사용하고 계신가요?',
        followUpQuestions: [
          '어떤 종류의 콘텐츠를 주로 올리시나요?',
          '팔로워들의 반응은 어떤가요?'
        ],
        priority: 'medium',
        triggerContext: ['content_strategy', 'social_media']
      });
    }

    if (!profile.expertiseCapability?.strengths || profile.expertiseCapability.strengths.length === 0) {
      questions.push({
        category: 'expertise',
        field: 'strengths',
        question: '본인만의 특별한 강점이나 전문성은 무엇인가요?',
        followUpQuestions: [
          '그 강점을 사업에 어떻게 활용하고 계신가요?',
          '더 발전시키고 싶은 역량이 있나요?'
        ],
        priority: 'medium',
        triggerContext: ['strength_analysis', 'skill_development']
      });
    }

    // 우선순위별로 정렬
    return questions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 전체 프로필 분석
  static analyzeProfile(profile: ExtendedProfile): ProfileAnalysis {
    const missingFields = this.analyzeMissingFields(profile);
    const priorityQuestions = this.generatePriorityQuestions(profile);
    const completionPercentage = this.calculateCompletionPercentage(profile);
    
    const incompleteSections: string[] = [];
    if (!profile.businessOperation || Object.keys(profile.businessOperation).length === 0) {
      incompleteSections.push('businessOperation');
    }
    if (!profile.customerDetails || Object.keys(profile.customerDetails).length === 0) {
      incompleteSections.push('customerDetails');
    }
    if (!profile.marketing || Object.keys(profile.marketing).length === 0) {
      incompleteSections.push('marketing');
    }
    if (!profile.brandIdentity || Object.keys(profile.brandIdentity).length === 0) {
      incompleteSections.push('brandIdentity');
    }

    const recommendations: string[] = [];
    if (completionPercentage < 30) {
      recommendations.push('기본 정보부터 차근차근 채워나가는 것이 좋겠습니다.');
    }
    if (missingFields.includes('businessOperation.monthlyRevenue')) {
      recommendations.push('매출 정보를 파악하면 더 정확한 성장 전략을 제안할 수 있습니다.');
    }
    if (missingFields.includes('customerDetails.ageDistribution')) {
      recommendations.push('고객 분석 정보가 있으면 타겟 마케팅 전략을 세울 수 있습니다.');
    }

    return {
      missingFields,
      incompleteSections,
      priorityQuestions,
      recommendations
    };
  }

  // 🆕 질문 빈도 결정 (신규 사용자는 더 자주)
  static getQuestionFrequency(profile: ExtendedProfile): number {
    const onboardingStage = this.getUserOnboardingStage(profile);
    const completionPercentage = this.calculateCompletionPercentage(profile);
    
    switch (onboardingStage) {
      case 'new': return 0.8; // 80% 확률로 질문
      case 'basic': return 0.6; // 60% 확률로 질문
      case 'intermediate': return 0.3; // 30% 확률로 질문
      case 'advanced': return 0.1; // 10% 확률로 질문
      default: return 0.4;
    }
  }

  // 🆕 질문해야 하는지 여부 판단
  static shouldAskQuestion(profile: ExtendedProfile, messagesSinceLastQuestion: number): boolean {
    const frequency = this.getQuestionFrequency(profile);
    const isNewUser = this.isNewUser(profile);
    
    // 신규 사용자는 매 메시지마다 질문 가능
    if (isNewUser && messagesSinceLastQuestion >= 1) {
      return Math.random() < frequency;
    }
    
    // 일반 사용자는 더 간격을 두고
    if (messagesSinceLastQuestion >= 2) {
      return Math.random() < frequency;
    }
    
    return false;
  }

  // 대화 컨텍스트 기반 질문 선택 (신규 사용자 우대)
  static getContextualQuestions(profile: ExtendedProfile, context: string): ProfileQuestion[] {
    const allQuestions = this.generatePriorityQuestions(profile);
    const isNewUser = this.isNewUser(profile);
    
    // 신규 사용자는 'any' 컨텍스트 질문도 포함
    const contextualQuestions = allQuestions.filter(q => 
      q.triggerContext && (
        q.triggerContext.includes(context) || 
        (isNewUser && q.triggerContext.includes('any'))
      )
    );
    
    // 신규 사용자는 더 많은 질문 반환
    const maxQuestions = isNewUser ? 3 : 2;
    return contextualQuestions.slice(0, maxQuestions);
  }

  // 🆕 온보딩 시퀀스 질문 생성 (중복 방지)
  static getOnboardingSequence(profile: ExtendedProfile): ProfileQuestion[] {
    const sequence: ProfileQuestion[] = [];
    
    // 1단계: 기본 식별 정보
    if (!profile.businessName || profile.businessName.trim() === '') {
      sequence.push({
        category: 'onboarding',
        field: 'businessName',
        question: '안녕하세요! 먼저 사업체나 브랜드 이름을 알려주시겠어요?',
        followUpQuestions: ['더 맞춤형 조언을 드리기 위해서예요 😊'],
        priority: 'high',
        triggerContext: ['greeting', 'any']
      });
    }
    
    // 2단계: 업종 파악
    if (!profile.industry || profile.industry.trim() === '') {
      sequence.push({
        category: 'onboarding',
        field: 'industry',
        question: '어떤 업종에서 사업하고 계신가요?',
        followUpQuestions: [
          '업종별로 마케팅 전략이 많이 달라져요',
          '해당 분야만의 특별한 어려움이 있나요?'
        ],
        priority: 'high',
        triggerContext: ['any']
      });
    }
    
    // 3단계: 사업 규모 파악
    if (!profile.businessOperation?.employeeCount) {
      sequence.push({
        category: 'onboarding',
        field: 'teamSize',
        question: '혼자 하시는 사업인가요, 아니면 팀이 있으신가요?',
        followUpQuestions: [
          '팀 규모에 따라 추천드릴 전략이 달라져요',
          '현재 가장 필요한 도움이 무엇인가요?'
        ],
        priority: 'high',
        triggerContext: ['any']
      });
    }
    
    console.log('🔄 온보딩 시퀀스 생성:', sequence.length + '개 질문');
    return sequence;
  }

  // 프로필 완성도 상태 업데이트
  static updateCompletionStatus(profile: ExtendedProfile): ExtendedProfile {
    const updatedProfile = { ...profile };
    updatedProfile.completionPercentage = this.calculateCompletionPercentage(profile);
    
    // 각 섹션별 완성 상태 업데이트
    updatedProfile.completionStatus = {
      basicInfo: !!(profile.name && profile.businessName && profile.businessType),
      businessOperation: !!(profile.businessOperation?.monthlyRevenue?.range && profile.businessOperation?.employeeCount),
      customerDetails: !!(profile.customerDetails?.ageDistribution && profile.customerDetails?.location),
      marketing: !!(profile.marketing?.monthlyBudget && profile.marketing?.currentPlatforms),
      brandIdentity: !!(profile.brandIdentity?.brandStory && profile.brandIdentity?.mission),
      personalCharacteristics: !!(profile.personalCharacteristics?.personalityType && profile.personalCharacteristics?.communicationStyle),
      workStyle: !!(profile.workStyle?.peakHours && profile.workStyle?.workStyle),
      goals: !!(profile.goalsStrategy?.businessGoals?.oneYearRevenue && profile.goalsStrategy?.businessGoals?.threeYearVision),
      contentSocialMedia: !!(profile.contentSocialMedia?.platforms && profile.contentSocialMedia?.preferredFormat),
      expertise: !!(profile.expertiseCapability?.strengths && profile.expertiseCapability?.improvementAreas)
    };
    
    return updatedProfile;
  }
}