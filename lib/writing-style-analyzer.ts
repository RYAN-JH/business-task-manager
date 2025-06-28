// 사용자 글쓰기 스타일 분석 시스템
export interface WritingStyleProfile {
  // 기본 통계
  averageMessageLength: number;
  vocabularySize: number;
  sentenceComplexity: 'simple' | 'moderate' | 'complex';
  
  // 어투와 성향
  tone: {
    formality: number; // 0-100 (격식체 vs 반말)
    enthusiasm: number; // 0-100 (차분함 vs 열정적)
    directness: number; // 0-100 (완곡함 vs 직설적)
    politeness: number; // 0-100 (무뚝뚝함 vs 정중함)
  };
  
  // 자주 사용하는 표현
  frequentWords: { [word: string]: number };
  frequentPhrases: { [phrase: string]: number };
  frequentEndings: { [ending: string]: number }; // 문장 끝맺음
  
  // 문체 특성
  writingPatterns: {
    usesEmojis: boolean;
    emojiFrequency: number;
    preferredEmojis: string[];
    usesExclamation: boolean;
    usesQuestion: boolean;
    usesEllipsis: boolean; // ... 사용
    usesBrackets: boolean; // () 사용
    usesQuotes: boolean; // "" 사용
  };
  
  // 언어적 특성
  linguisticTraits: {
    preferredConjunctions: string[]; // 접속사 (그리고, 하지만, 그런데 등)
    preferredInterjections: string[]; // 감탄사 (아, 오, 와 등)
    preferredFillers: string[]; // 추임새 (음, 어, 뭔가 등)
    questionStyle: 'direct' | 'indirect' | 'rhetorical';
  };
  
  // 주제별 관심사
  topicInterests: {
    [topic: string]: {
      frequency: number;
      averageEngagement: number; // 메시지 길이나 질문 수로 측정
      keyTerms: string[];
    };
  };
  
  // 시간대별 패턴
  temporalPatterns: {
    preferredCommunicationTime: string[];
    responseSpeed: 'immediate' | 'quick' | 'thoughtful' | 'delayed';
    messageFrequency: number; // 하루 평균 메시지 수
  };
  
  // 메타 정보
  lastAnalyzed: string;
  totalMessagesAnalyzed: number;
  confidenceScore: number; // 0-100 (분석 신뢰도)
  evolutionTrend: 'stable' | 'evolving' | 'significant_change';
}

// 메시지 분석을 위한 인터페이스
export interface MessageAnalysis {
  length: number;
  sentenceCount: number;
  wordCount: number;
  vocabularyRichness: number;
  tone: {
    formality: number;
    enthusiasm: number;
    directness: number;
    politeness: number;
  };
  patterns: {
    emojis: string[];
    exclamations: number;
    questions: number;
    ellipsis: number;
    brackets: number;
    quotes: number;
  };
  linguisticFeatures: {
    conjunctions: string[];
    interjections: string[];
    fillers: string[];
    endings: string[];
  };
  extractedWords: string[];
  extractedPhrases: string[];
  topics: string[];
  timestamp: Date;
}

// 글쓰기 스타일 분석기
export class WritingStyleAnalyzer {
  
  // 메시지 분석
  static analyzeMessage(message: string): MessageAnalysis {
    const cleanText = message.trim();
    
    return {
      length: cleanText.length,
      sentenceCount: this.countSentences(cleanText),
      wordCount: this.countWords(cleanText),
      vocabularyRichness: this.calculateVocabularyRichness(cleanText),
      tone: this.analyzeTone(cleanText),
      patterns: this.analyzePatterns(cleanText),
      linguisticFeatures: this.analyzeLinguisticFeatures(cleanText),
      extractedWords: this.extractSignificantWords(cleanText),
      extractedPhrases: this.extractPhrases(cleanText),
      topics: this.extractTopics(cleanText),
      timestamp: new Date()
    };
  }
  
  // 문장 수 계산
  private static countSentences(text: string): number {
    return (text.match(/[.!?]+/g) || []).length || 1;
  }
  
  // 단어 수 계산
  private static countWords(text: string): number {
    return text.replace(/[^\w\s가-힣]/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  }
  
  // 어휘 다양성 계산
  private static calculateVocabularyRichness(text: string): number {
    const words = text.replace(/[^\w\s가-힣]/g, ' ').split(/\s+/).filter(w => w.length > 1);
    const uniqueWords = new Set(words);
    return words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0;
  }
  
  // 어투 분석
  private static analyzeTone(text: string): MessageAnalysis['tone'] {
    const lowerText = text.toLowerCase();
    
    // 격식체 vs 반말
    const formalMarkers = ['습니다', '입니다', '하십시오', '해주세요', '드립니다'];
    const informalMarkers = ['해', '야', '지', '거야', '네', '어'];
    const formalScore = formalMarkers.reduce((score, marker) => 
      score + (text.includes(marker) ? 20 : 0), 0);
    const informalScore = informalMarkers.reduce((score, marker) => 
      score + (text.includes(marker) ? 20 : 0), 0);
    
    // 열정 vs 차분함
    const enthusiasticMarkers = ['!', '와', '대박', '완전', '진짜', '정말', '너무'];
    const enthusiasmScore = enthusiasticMarkers.reduce((score, marker) => 
      score + (lowerText.includes(marker) ? 15 : 0), 0);
    
    // 직설적 vs 완곡함
    const directMarkers = ['바로', '즉시', '확실히', '당연히', '명확히'];
    const indirectMarkers = ['아마', '혹시', '좀', '살짝', '약간'];
    const directScore = directMarkers.reduce((score, marker) => 
      score + (lowerText.includes(marker) ? 20 : 0), 0);
    const indirectScore = indirectMarkers.reduce((score, marker) => 
      score + (lowerText.includes(marker) ? 20 : 0), 0);
    
    // 정중함
    const politeMarkers = ['감사', '죄송', '부탁', '양해', '고마', '미안'];
    const politenessScore = politeMarkers.reduce((score, marker) => 
      score + (lowerText.includes(marker) ? 20 : 0), 0);
    
    return {
      formality: Math.min(100, Math.max(0, formalScore - informalScore + 50)),
      enthusiasm: Math.min(100, enthusiasmScore),
      directness: Math.min(100, Math.max(0, directScore - indirectScore + 50)),
      politeness: Math.min(100, politenessScore)
    };
  }
  
  // 패턴 분석
  private static analyzePatterns(text: string): MessageAnalysis['patterns'] {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];
    
    return {
      emojis,
      exclamations: (text.match(/!/g) || []).length,
      questions: (text.match(/\?/g) || []).length,
      ellipsis: (text.match(/\.\.\./g) || []).length,
      brackets: (text.match(/\([^)]*\)/g) || []).length,
      quotes: (text.match(/["'][^"']*["']/g) || []).length
    };
  }
  
  // 언어적 특성 분석
  private static analyzeLinguisticFeatures(text: string): MessageAnalysis['linguisticFeatures'] {
    const conjunctions = ['그리고', '하지만', '그런데', '그러나', '또한', '또', '그래서', '따라서'];
    const interjections = ['아', '오', '와', '어', '음', '허', '참'];
    const fillers = ['뭔가', '좀', '약간', '살짝', '어떻게', '그냥'];
    const endings = ['요', '어요', '네요', '죠', '거에요', '는데요', '군요'];
    
    return {
      conjunctions: conjunctions.filter(c => text.includes(c)),
      interjections: interjections.filter(i => text.includes(i)),
      fillers: fillers.filter(f => text.includes(f)),
      endings: endings.filter(e => text.includes(e))
    };
  }
  
  // 의미있는 단어 추출
  private static extractSignificantWords(text: string): string[] {
    const stopWords = new Set(['이', '그', '저', '것', '수', '있', '하', '되', '의', '가', '을', '를', '에', '와', '과', '도', '만', '부터', '까지']);
    const words = text.replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w))
      .map(w => w.toLowerCase());
    
    // 빈도 계산하여 상위 단어들 반환
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }
  
  // 구문 추출
  private static extractPhrases(text: string): string[] {
    const phrases: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      // 2-4 단어 구문 추출
      for (let i = 0; i < words.length - 1; i++) {
        for (let len = 2; len <= Math.min(4, words.length - i); len++) {
          const phrase = words.slice(i, i + len).join(' ').trim();
          if (phrase.length > 3 && phrase.length < 20) {
            phrases.push(phrase);
          }
        }
      }
    });
    
    return [...new Set(phrases)].slice(0, 15);
  }
  
  // 주제 추출
  private static extractTopics(text: string): string[] {
    const topicKeywords = {
      '비즈니스': ['사업', '비즈니스', '회사', '기업', '창업', '매출', '수익'],
      '브랜딩': ['브랜드', '브랜딩', '포지셔닝', '차별화', '아이덴티티'],
      '마케팅': ['마케팅', '광고', '홍보', '프로모션', '캠페인'],
      '콘텐츠': ['콘텐츠', '컨텐츠', '포스팅', '글', '영상', '사진'],
      '고객': ['고객', '소비자', '구매자', '타겟', '클라이언트'],
      '전략': ['전략', '계획', '방향', '목표', '로드맵'],
      '성장': ['성장', '확장', '발전', '개선', '향상'],
      '기술': ['기술', '시스템', '플랫폼', '솔루션', '도구']
    };
    
    const lowerText = text.toLowerCase();
    const topics: string[] = [];
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }
  
  // 여러 메시지를 통합하여 전체 스타일 프로필 생성
  static buildStyleProfile(messages: MessageAnalysis[]): WritingStyleProfile {
    if (messages.length === 0) {
      return this.getDefaultProfile();
    }
    
    const totalMessages = messages.length;
    const recentMessages = messages.slice(-50); // 최근 50개 메시지 중점 분석
    
    // 기본 통계
    const avgLength = recentMessages.reduce((sum, m) => sum + m.length, 0) / recentMessages.length;
    const allWords = recentMessages.flatMap(m => m.extractedWords);
    const vocabularySize = new Set(allWords).size;
    
    // 어투 평균
    const avgTone = recentMessages.reduce((acc, m) => ({
      formality: acc.formality + m.tone.formality,
      enthusiasm: acc.enthusiasm + m.tone.enthusiasm,
      directness: acc.directness + m.tone.directness,
      politeness: acc.politeness + m.tone.politeness
    }), { formality: 0, enthusiasm: 0, directness: 0, politeness: 0 });
    
    Object.keys(avgTone).forEach(key => {
      avgTone[key as keyof typeof avgTone] /= recentMessages.length;
    });
    
    // 빈도 계산
    const frequentWords = this.calculateFrequency(recentMessages.flatMap(m => m.extractedWords));
    const frequentPhrases = this.calculateFrequency(recentMessages.flatMap(m => m.extractedPhrases));
    const frequentEndings = this.calculateFrequency(recentMessages.flatMap(m => m.linguisticFeatures.endings));
    
    // 패턴 분석
    const allEmojis = recentMessages.flatMap(m => m.patterns.emojis);
    const emojiFrequency = allEmojis.length / recentMessages.length;
    
    // 주제별 관심사
    const topicInterests = this.analyzeTopicInterests(recentMessages);
    
    return {
      averageMessageLength: Math.round(avgLength),
      vocabularySize,
      sentenceComplexity: this.determineSentenceComplexity(recentMessages),
      tone: {
        formality: Math.round(avgTone.formality),
        enthusiasm: Math.round(avgTone.enthusiasm),
        directness: Math.round(avgTone.directness),
        politeness: Math.round(avgTone.politeness)
      },
      frequentWords,
      frequentPhrases,
      frequentEndings,
      writingPatterns: {
        usesEmojis: emojiFrequency > 0.3,
        emojiFrequency: Math.round(emojiFrequency * 100) / 100,
        preferredEmojis: this.getTopItems(allEmojis, 10),
        usesExclamation: recentMessages.some(m => m.patterns.exclamations > 0),
        usesQuestion: recentMessages.some(m => m.patterns.questions > 0),
        usesEllipsis: recentMessages.some(m => m.patterns.ellipsis > 0),
        usesBrackets: recentMessages.some(m => m.patterns.brackets > 0),
        usesQuotes: recentMessages.some(m => m.patterns.quotes > 0)
      },
      linguisticTraits: {
        preferredConjunctions: this.getTopItems(recentMessages.flatMap(m => m.linguisticFeatures.conjunctions), 5),
        preferredInterjections: this.getTopItems(recentMessages.flatMap(m => m.linguisticFeatures.interjections), 5),
        preferredFillers: this.getTopItems(recentMessages.flatMap(m => m.linguisticFeatures.fillers), 5),
        questionStyle: this.determineQuestionStyle(recentMessages)
      },
      topicInterests,
      temporalPatterns: {
        preferredCommunicationTime: [],
        responseSpeed: 'thoughtful',
        messageFrequency: totalMessages
      },
      lastAnalyzed: new Date().toISOString(),
      totalMessagesAnalyzed: totalMessages,
      confidenceScore: Math.min(100, totalMessages * 2), // 메시지 수에 따른 신뢰도
      evolutionTrend: 'stable'
    };
  }
  
  // 도구 메서드들
  private static calculateFrequency(items: string[]): { [key: string]: number } {
    const freq: { [key: string]: number } = {};
    items.forEach(item => {
      freq[item] = (freq[item] || 0) + 1;
    });
    
    // 상위 20개만 반환
    return Object.entries(freq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  }
  
  private static getTopItems(items: string[], limit: number): string[] {
    const freq: { [key: string]: number } = {};
    items.forEach(item => {
      freq[item] = (freq[item] || 0) + 1;
    });
    
    return Object.entries(freq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }
  
  private static determineSentenceComplexity(messages: MessageAnalysis[]): 'simple' | 'moderate' | 'complex' {
    const avgWordsPerSentence = messages.reduce((sum, m) => 
      sum + (m.wordCount / m.sentenceCount), 0) / messages.length;
    
    if (avgWordsPerSentence < 8) return 'simple';
    if (avgWordsPerSentence < 15) return 'moderate';
    return 'complex';
  }
  
  private static determineQuestionStyle(messages: MessageAnalysis[]): 'direct' | 'indirect' | 'rhetorical' {
    // 질문 스타일 분석 로직 (간단한 버전)
    return 'direct'; // 추후 고도화
  }
  
  private static analyzeTopicInterests(messages: MessageAnalysis[]): WritingStyleProfile['topicInterests'] {
    const topicData: { [topic: string]: { messages: MessageAnalysis[], totalLength: number } } = {};
    
    messages.forEach(message => {
      message.topics.forEach(topic => {
        if (!topicData[topic]) {
          topicData[topic] = { messages: [], totalLength: 0 };
        }
        topicData[topic].messages.push(message);
        topicData[topic].totalLength += message.length;
      });
    });
    
    const result: WritingStyleProfile['topicInterests'] = {};
    Object.entries(topicData).forEach(([topic, data]) => {
      result[topic] = {
        frequency: data.messages.length,
        averageEngagement: data.totalLength / data.messages.length,
        keyTerms: this.getTopItems(data.messages.flatMap(m => m.extractedWords), 10)
      };
    });
    
    return result;
  }
  
  private static getDefaultProfile(): WritingStyleProfile {
    return {
      averageMessageLength: 0,
      vocabularySize: 0,
      sentenceComplexity: 'simple',
      tone: { formality: 50, enthusiasm: 50, directness: 50, politeness: 50 },
      frequentWords: {},
      frequentPhrases: {},
      frequentEndings: {},
      writingPatterns: {
        usesEmojis: false,
        emojiFrequency: 0,
        preferredEmojis: [],
        usesExclamation: false,
        usesQuestion: false,
        usesEllipsis: false,
        usesBrackets: false,
        usesQuotes: false
      },
      linguisticTraits: {
        preferredConjunctions: [],
        preferredInterjections: [],
        preferredFillers: [],
        questionStyle: 'direct'
      },
      topicInterests: {},
      temporalPatterns: {
        preferredCommunicationTime: [],
        responseSpeed: 'thoughtful',
        messageFrequency: 0
      },
      lastAnalyzed: new Date().toISOString(),
      totalMessagesAnalyzed: 0,
      confidenceScore: 0,
      evolutionTrend: 'stable'
    };
  }
}