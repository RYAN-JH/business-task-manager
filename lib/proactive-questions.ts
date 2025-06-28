// Admin 전용 능동적 질문 시스템

export interface ProactiveQuestion {
  id: string;
  personaType: 'moment.ryan' | 'atozit';
  category: 'expertise' | 'personality' | 'business' | 'writing_style' | 'methodology' | 'experience';
  questionText: string;
  followUpQuestions: string[];
  triggerConditions: {
    contextKeywords: string[];
    sessionLength: number; // 최소 세션 길이 (메시지 수)
    cooldownMinutes: number; // 마지막 질문 후 대기 시간
    priority: number; // 1-10 (1이 최고 우선순위)
  };
  expectedInsights: string[]; // 이 질문으로부터 얻을 수 있는 인사이트 유형
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
}

export interface QuestionContext {
  sessionId: string;
  messageCount: number;
  recentTopics: string[];
  lastQuestionTime?: string;
  adminEmail: string;
  conversationFlow: 'initial' | 'deepening' | 'exploration' | 'synthesis';
}

export class ProactiveQuestionService {
  private static readonly QUESTION_TEMPLATES: Record<string, ProactiveQuestion[]> = {
    'moment.ryan': [
      // 마케팅 전문성 탐구
      {
        id: 'mkt_strategy_approach',
        personaType: 'moment.ryan',
        category: 'expertise',
        questionText: '마케팅 전략을 수립할 때 가장 중요하게 생각하는 요소는 무엇인가요? 데이터 중심 접근법과 직관적 접근법 중 어느 쪽을 선호하시나요?',
        followUpQuestions: [
          '그 접근법을 선택하는 이유는 무엇인가요?',
          '실제 프로젝트에서 어떻게 적용하셨나요?',
          '예상과 다른 결과가 나왔을 때는 어떻게 대응하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['마케팅', '전략', '계획', '접근법'],
          sessionLength: 3,
          cooldownMinutes: 30,
          priority: 2
        },
        expectedInsights: ['마케팅 철학', '의사결정 스타일', '문제해결 방식'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'content_creation_process',
        personaType: 'moment.ryan',
        category: 'methodology',
        questionText: '콘텐츠를 기획하고 제작할 때의 프로세스를 설명해주실 수 있나요? 영감은 주로 어디서 얻으시나요?',
        followUpQuestions: [
          '콘텐츠의 품질을 어떻게 평가하시나요?',
          '타겟 오디언스를 분석하는 본인만의 방법이 있나요?',
          '트렌드를 어떻게 파악하고 활용하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['콘텐츠', '기획', '제작', '창작'],
          sessionLength: 5,
          cooldownMinutes: 25,
          priority: 3
        },
        expectedInsights: ['창작 프로세스', '영감 소스', '품질 기준'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'sns_philosophy',
        personaType: 'moment.ryan',
        category: 'personality',
        questionText: 'SNS를 통한 커뮤니케이션에서 가장 중요하게 생각하는 가치는 무엇인가요? 개인 브랜딩에 대한 철학을 들려주세요.',
        followUpQuestions: [
          '팔로워들과의 진정성 있는 소통을 위해 어떤 노력을 하시나요?',
          '개인적인 부분과 전문적인 부분의 균형을 어떻게 맞추시나요?',
          'SNS에서 겪은 어려움이나 실패 경험이 있다면?'
        ],
        triggerConditions: {
          contextKeywords: ['SNS', '소셜미디어', '커뮤니케이션', '브랜딩'],
          sessionLength: 4,
          cooldownMinutes: 35,
          priority: 4
        },
        expectedInsights: ['커뮤니케이션 철학', '개인 가치관', '브랜딩 접근법'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'industry_trends',
        personaType: 'moment.ryan',
        category: 'expertise',
        questionText: '디지털 마케팅 업계의 최근 변화 중에서 가장 주목하고 있는 트렌드는 무엇인가요? 앞으로 어떤 방향으로 발전할 것 같나요?',
        followUpQuestions: [
          '그 트렌드가 실제 비즈니스에 미치는 영향은 어떤가요?',
          '새로운 기술이나 플랫폼에 어떻게 대응하시나요?',
          '변화에 적응하기 위해 어떤 학습이나 준비를 하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['트렌드', '변화', '미래', '기술', '플랫폼'],
          sessionLength: 6,
          cooldownMinutes: 40,
          priority: 5
        },
        expectedInsights: ['시장 인사이트', '미래 전망', '적응 전략'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ],
    'atozit': [
      // 브랜딩 전문성 탐구
      {
        id: 'branding_philosophy',
        personaType: 'atozit',
        category: 'expertise',
        questionText: '브랜딩에 대한 당신의 철학은 무엇인가요? 강력한 브랜드를 만드는 핵심 요소는 무엇이라고 생각하시나요?',
        followUpQuestions: [
          '브랜드 아이덴티티와 브랜드 이미지의 차이를 어떻게 설명하시나요?',
          '브랜드의 일관성을 유지하기 위한 구체적인 방법이 있나요?',
          '브랜드 리뉴얼이나 포지셔닝 변경 시 고려사항은?'
        ],
        triggerConditions: {
          contextKeywords: ['브랜딩', '아이덴티티', '포지셔닝', '차별화'],
          sessionLength: 3,
          cooldownMinutes: 30,
          priority: 2
        },
        expectedInsights: ['브랜딩 철학', '핵심 가치관', '전략적 사고'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'customer_experience_design',
        personaType: 'atozit',
        category: 'methodology',
        questionText: '고객 경험을 설계할 때 어떤 프레임워크나 방법론을 사용하시나요? 고객의 니즈를 파악하는 본인만의 방법이 있나요?',
        followUpQuestions: [
          '고객 여정의 어떤 단계가 가장 중요하다고 생각하시나요?',
          '고객 피드백을 어떻게 수집하고 분석하시나요?',
          '예상치 못한 고객 반응에는 어떻게 대응하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['고객경험', 'CX', '사용자', '여정', '서비스'],
          sessionLength: 4,
          cooldownMinutes: 35,
          priority: 3
        },
        expectedInsights: ['CX 방법론', '고객 이해', '서비스 설계'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'business_strategy_mindset',
        personaType: 'atozit',
        category: 'business',
        questionText: '경영 전략을 수립할 때 가장 중요하게 고려하는 요소는 무엇인가요? 단기 성과와 장기 비전 사이의 균형을 어떻게 맞추시나요?',
        followUpQuestions: [
          '시장 변화에 빠르게 대응하면서도 일관성을 유지하는 방법은?',
          '리스크 관리에 대한 접근 방식을 설명해주세요.',
          '성공과 실패를 어떤 기준으로 판단하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['전략', '경영', '비즈니스', '의사결정', '성장'],
          sessionLength: 5,
          cooldownMinutes: 30,
          priority: 4
        },
        expectedInsights: ['경영 철학', '전략적 사고', '리더십 스타일'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'digital_transformation',
        personaType: 'atozit',
        category: 'expertise',
        questionText: '디지털 트랜스포메이션을 진행할 때 가장 큰 도전과제는 무엇이라고 생각하시나요? 조직의 저항을 어떻게 극복하시나요?',
        followUpQuestions: [
          '기술 도입과 조직 문화 변화 중 무엇이 더 중요한가요?',
          '변화 관리를 위한 구체적인 전략이나 사례가 있나요?',
          'ROI를 어떻게 측정하고 관리하시나요?'
        ],
        triggerConditions: {
          contextKeywords: ['디지털', '변화', '혁신', '조직', '프로세스'],
          sessionLength: 6,
          cooldownMinutes: 40,
          priority: 5
        },
        expectedInsights: ['변화 관리', '혁신 접근법', '조직 리더십'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ]
  };

  // 적절한 능동적 질문 선택
  static async selectProactiveQuestion(
    context: QuestionContext,
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<ProactiveQuestion | null> {
    try {
      const availableQuestions = this.QUESTION_TEMPLATES[personaType] || [];
      
      // 조건에 맞는 질문들 필터링
      const eligibleQuestions = availableQuestions.filter(question => 
        this.isQuestionEligible(question, context)
      );

      if (eligibleQuestions.length === 0) {
        return null;
      }

      // 우선순위와 사용 빈도를 고려하여 질문 선택
      const selectedQuestion = this.selectBestQuestion(eligibleQuestions);
      
      // 질문 사용 기록 업데이트
      await this.recordQuestionUsage(selectedQuestion.id, context);
      
      console.log(`❓ 능동적 질문 선택: ${personaType} - ${selectedQuestion.category}`);
      
      return selectedQuestion;
    } catch (error) {
      console.error('능동적 질문 선택 실패:', error);
      return null;
    }
  }

  // 질문 적격성 검사
  private static isQuestionEligible(
    question: ProactiveQuestion,
    context: QuestionContext
  ): boolean {
    // 비활성화된 질문 제외
    if (!question.isActive) {
      return false;
    }

    // 최소 세션 길이 확인
    if (context.messageCount < question.triggerConditions.sessionLength) {
      return false;
    }

    // 쿨다운 시간 확인
    if (question.lastUsed && context.lastQuestionTime) {
      const lastUsedTime = new Date(question.lastUsed).getTime();
      const now = Date.now();
      const cooldownMs = question.triggerConditions.cooldownMinutes * 60 * 1000;
      
      if (now - lastUsedTime < cooldownMs) {
        return false;
      }
    }

    // 컨텍스트 키워드 매칭 확인
    const hasMatchingKeywords = question.triggerConditions.contextKeywords.some(keyword =>
      context.recentTopics.some(topic => 
        topic.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(topic.toLowerCase())
      )
    );

    return hasMatchingKeywords;
  }

  // 최적 질문 선택 알고리즘
  private static selectBestQuestion(questions: ProactiveQuestion[]): ProactiveQuestion {
    // 우선순위, 사용 빈도, 다양성을 고려한 점수 계산
    const scoredQuestions = questions.map(question => {
      const priorityScore = (11 - question.triggerConditions.priority) * 10; // 우선순위가 높을수록 높은 점수
      const usageScore = Math.max(0, 50 - question.usageCount * 5); // 적게 사용된 질문일수록 높은 점수
      const categoryDiversityScore = this.getCategoryDiversityScore(question.category);
      
      return {
        question,
        totalScore: priorityScore + usageScore + categoryDiversityScore
      };
    });

    // 가장 높은 점수의 질문 선택
    const bestQuestion = scoredQuestions.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );

    return bestQuestion.question;
  }

  // 카테고리 다양성 점수 계산
  private static getCategoryDiversityScore(category: string): number {
    // 실제로는 최근 질문 히스토리를 기반으로 다양성 점수 계산
    // 같은 카테고리가 연속으로 나오지 않도록 조정
    const categoryWeights = {
      'expertise': 10,
      'personality': 8,
      'business': 9,
      'writing_style': 6,
      'methodology': 7,
      'experience': 8
    };

    return categoryWeights[category as keyof typeof categoryWeights] || 5;
  }

  // 질문 사용 기록
  private static async recordQuestionUsage(
    questionId: string,
    context: QuestionContext
  ): Promise<void> {
    try {
      // 실제로는 데이터베이스에 사용 기록 저장
      console.log(`📝 질문 사용 기록: ${questionId} - ${context.adminEmail}`);
      
      // 질문 템플릿의 사용 횟수와 마지막 사용 시간 업데이트
      // UPDATE ProactiveQuestionTemplate 
      // SET usageCount = usageCount + 1, lastUsed = NOW()
      // WHERE id = questionId
    } catch (error) {
      console.error('질문 사용 기록 실패:', error);
    }
  }

  // 후속 질문 생성
  static async generateFollowUpQuestion(
    originalQuestion: ProactiveQuestion,
    adminResponse: string,
    context: QuestionContext
  ): Promise<string | null> {
    try {
      // 관리자 응답을 분석하여 적절한 후속 질문 선택
      const responseAnalysis = this.analyzeResponse(adminResponse);
      const followUps = originalQuestion.followUpQuestions;

      if (followUps.length === 0) {
        return null;
      }

      // 응답 내용에 따라 가장 적절한 후속 질문 선택
      const selectedFollowUp = this.selectFollowUpQuestion(followUps, responseAnalysis);
      
      console.log(`🔄 후속 질문 생성: ${originalQuestion.category}`);
      
      return selectedFollowUp;
    } catch (error) {
      console.error('후속 질문 생성 실패:', error);
      return null;
    }
  }

  // 응답 분석
  private static analyzeResponse(response: string): any {
    return {
      length: response.length,
      sentiment: 'positive', // 실제로는 감정 분석
      complexity: response.split('.').length > 3 ? 'high' : 'medium',
      keywords: response.toLowerCase().split(/\s+/).slice(0, 10),
      hasExample: response.includes('예를 들어') || response.includes('예시'),
      hasPersonalExperience: response.includes('제가') || response.includes('저는')
    };
  }

  // 후속 질문 선택
  private static selectFollowUpQuestion(
    followUps: string[],
    responseAnalysis: any
  ): string {
    // 응답 분석 결과에 따라 적절한 후속 질문 선택
    if (responseAnalysis.hasExample) {
      // 구체적인 예시가 있으면 심화 질문
      return followUps.find(q => q.includes('어떻게') || q.includes('구체적')) || followUps[0];
    }

    if (responseAnalysis.hasPersonalExperience) {
      // 개인 경험이 포함되면 경험 관련 후속 질문
      return followUps.find(q => q.includes('경험') || q.includes('실제')) || followUps[0];
    }

    // 기본적으로 첫 번째 후속 질문 선택
    return followUps[0];
  }

  // 질문 효과성 분석
  static async analyzeQuestionEffectiveness(
    questionId: string,
    adminResponse: string,
    extractedInsights: any[]
  ): Promise<void> {
    try {
      const effectiveness = {
        responseQuality: this.evaluateResponseQuality(adminResponse),
        insightValue: this.evaluateInsightValue(extractedInsights),
        engagementLevel: this.evaluateEngagement(adminResponse)
      };

      console.log(`📊 질문 효과성 분석: ${questionId} - 품질: ${effectiveness.responseQuality}`);
      
      // 실제로는 데이터베이스에 효과성 데이터 저장하여 향후 질문 개선에 활용
    } catch (error) {
      console.error('질문 효과성 분석 실패:', error);
    }
  }

  // 응답 품질 평가
  private static evaluateResponseQuality(response: string): number {
    const length = response.length;
    const sentences = response.split('.').length;
    const hasDetails = response.includes('예를 들어') || response.includes('구체적으로');
    
    let score = 0;
    if (length > 100) score += 30;
    if (sentences > 2) score += 30;
    if (hasDetails) score += 40;
    
    return Math.min(100, score);
  }

  // 인사이트 가치 평가
  private static evaluateInsightValue(insights: any[]): number {
    if (!insights || insights.length === 0) return 0;
    
    const uniqueInsights = new Set(insights.map(i => i.type)).size;
    return Math.min(100, uniqueInsights * 25);
  }

  // 참여도 평가
  private static evaluateEngagement(response: string): number {
    const engagementIndicators = [
      '흥미로운', '정말', '실제로', '경험상', '개인적으로',
      '생각해보니', '말씀하신', '질문', '궁금'
    ];
    
    const matches = engagementIndicators.filter(indicator => 
      response.toLowerCase().includes(indicator)
    ).length;
    
    return Math.min(100, matches * 20);
  }

  // 질문 템플릿 추가/수정
  static async addQuestionTemplate(
    question: Omit<ProactiveQuestion, 'id' | 'usageCount' | 'createdAt'>
  ): Promise<string> {
    const questionId = this.generateId();
    const newQuestion: ProactiveQuestion = {
      ...question,
      id: questionId,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };

    // 실제로는 데이터베이스에 저장
    console.log(`➕ 새 질문 템플릿 추가: ${question.personaType} - ${question.category}`);
    
    return questionId;
  }

  // ID 생성
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}