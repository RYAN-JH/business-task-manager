// 개인화된 글쓰기 생성 엔진 - 사용자가 직접 쓴 것 같은 글을 생성
import { MasterUserProfile } from './master-profile-system';
import { WritingStyleProfile } from './writing-style-analyzer';

export interface WritingRequest {
  content: string;
  purpose: 'response' | 'suggestion' | 'draft' | 'example';
  targetAudience?: string;
  tone?: 'match_user' | 'professional' | 'casual' | 'enthusiastic';
  length?: 'short' | 'medium' | 'long';
  includeEmojis?: boolean;
  context?: string;
  generateAlternatives?: boolean;
}

export interface PersonalizedWritingResult {
  originalContent: string;
  personalizedContent: string;
  styleApplication: {
    toneAdjustments: string[];
    vocabularyMatches: string[];
    patternApplications: string[];
    structuralChanges: string[];
  };
  confidenceScore: number; // 0-100 (개인화 정확도)
  alternatives?: string[];
}

// 개인화 글쓰기 엔진
export class PersonalizedWritingEngine {
  
  // 메인 개인화 함수
  static generatePersonalizedContent(
    request: WritingRequest,
    masterProfile: MasterUserProfile
  ): PersonalizedWritingResult {
    
    const writingStyle = masterProfile.writingStyle;
    const learnedPatterns = masterProfile.learnedPatterns;
    const insights = masterProfile.personalizationInsights;
    
    // 1. 기본 스타일 적용
    let personalizedContent = this.applyBasicStyle(request.content, writingStyle);
    
    // 2. 어투 조정
    personalizedContent = this.adjustTone(personalizedContent, writingStyle, request.tone);
    
    // 3. 어휘 개인화
    personalizedContent = this.personalizeVocabulary(personalizedContent, writingStyle);
    
    // 4. 문장 구조 조정
    personalizedContent = this.adjustSentenceStructure(personalizedContent, writingStyle);
    
    // 5. 패턴 적용
    personalizedContent = this.applyWritingPatterns(personalizedContent, writingStyle, request);
    
    // 6. 컨텍스트 반영
    personalizedContent = this.applyContextualAdjustments(personalizedContent, masterProfile, request);
    
    // 7. 품질 검증 및 신뢰도 계산
    const confidenceScore = this.calculateConfidenceScore(masterProfile, request);
    
    // 8. 스타일 적용 로그 생성
    const styleApplication = this.generateStyleApplicationLog(request.content, personalizedContent, writingStyle);
    
    // 9. 대안 생성 (재귀 방지를 위해 조건부 실행)
    const alternatives = request.generateAlternatives !== false ? 
      this.generateAlternatives(request, masterProfile) : [];
    
    return {
      originalContent: request.content,
      personalizedContent,
      styleApplication,
      confidenceScore,
      alternatives
    };
  }
  
  // 기본 스타일 적용
  private static applyBasicStyle(content: string, style: WritingStyleProfile): string {
    let result = content;
    
    // 문장 길이 조정
    if (style.averageMessageLength < 50) {
      // 간결한 스타일 선호
      result = this.makeContentConcise(result);
    } else if (style.averageMessageLength > 150) {
      // 상세한 스타일 선호
      result = this.expandContent(result);
    }
    
    // 격식도 조정
    if (style.tone.formality > 70) {
      result = this.makeFormal(result);
    } else if (style.tone.formality < 30) {
      result = this.makeCasual(result);
    }
    
    return result;
  }
  
  // 어투 조정
  private static adjustTone(content: string, style: WritingStyleProfile, requestedTone?: string): string {
    let result = content;
    
    if (requestedTone === 'match_user' || !requestedTone) {
      // 사용자 스타일에 맞춤
      
      // 열정도 조정
      if (style.tone.enthusiasm > 70) {
        result = this.addEnthusiasm(result);
      } else if (style.tone.enthusiasm < 30) {
        result = this.reduceEnthusiasm(result);
      }
      
      // 직설성 조정
      if (style.tone.directness > 70) {
        result = this.makeMoreDirect(result);
      } else if (style.tone.directness < 30) {
        result = this.makeMoreIndirect(result);
      }
      
      // 정중함 조정
      if (style.tone.politeness > 70) {
        result = this.addPoliteness(result);
      }
    }
    
    return result;
  }
  
  // 어휘 개인화
  private static personalizeVocabulary(content: string, style: WritingStyleProfile): string {
    let result = content;
    
    // 자주 사용하는 단어로 교체
    const frequentWords = Object.keys(style.frequentWords);
    const vocabularyMap = this.createVocabularyMap(frequentWords);
    
    Object.entries(vocabularyMap).forEach(([standard, personal]) => {
      const regex = new RegExp(`\\b${standard}\\b`, 'gi');
      result = result.replace(regex, personal);
    });
    
    // 선호하는 접속사 사용
    if (style.linguisticTraits.preferredConjunctions.length > 0) {
      result = this.replaceConjunctions(result, style.linguisticTraits.preferredConjunctions);
    }
    
    // 선호하는 추임새 추가
    if (style.linguisticTraits.preferredFillers.length > 0) {
      result = this.addFillers(result, style.linguisticTraits.preferredFillers);
    }
    
    return result;
  }
  
  // 문장 구조 조정
  private static adjustSentenceStructure(content: string, style: WritingStyleProfile): string {
    let result = content;
    
    // 문장 복잡도 조정
    if (style.sentenceComplexity === 'simple') {
      result = this.simplifyStructure(result);
    } else if (style.sentenceComplexity === 'complex') {
      result = this.complexifyStructure(result);
    }
    
    // 선호하는 문장 끝맺음 적용
    if (Object.keys(style.frequentEndings).length > 0) {
      result = this.applyPreferredEndings(result, style.frequentEndings);
    }
    
    return result;
  }
  
  // 글쓰기 패턴 적용
  private static applyWritingPatterns(content: string, style: WritingStyleProfile, request: WritingRequest): string {
    let result = content;
    
    const patterns = style.writingPatterns;
    
    // 이모지 사용
    if (patterns.usesEmojis && (request.includeEmojis !== false)) {
      result = this.addAppropriateEmojis(result, patterns.preferredEmojis);
    }
    
    // 느낌표 사용
    if (patterns.usesExclamation && style.tone.enthusiasm > 60) {
      result = this.addExclamations(result);
    }
    
    // 말줄임표 사용
    if (patterns.usesEllipsis) {
      result = this.addEllipsis(result);
    }
    
    // 괄호 사용
    if (patterns.usesBrackets) {
      result = this.addBrackets(result);
    }
    
    return result;
  }
  
  // 컨텍스트 조정
  private static applyContextualAdjustments(
    content: string, 
    masterProfile: MasterUserProfile, 
    request: WritingRequest
  ): string {
    let result = content;
    
    const insights = masterProfile.personalizationInsights;
    
    // 동기 요인 반영
    if (insights.motivationFactors.length > 0) {
      result = this.incorporateMotivation(result, insights.motivationFactors);
    }
    
    // 개인적 선호도 반영
    const preferences = masterProfile.contextMemory.personalReferences;
    if (preferences.length > 0) {
      result = this.incorporatePreferences(result, preferences);
    }
    
    // 진행 중인 프로젝트 참조
    const ongoingProjects = masterProfile.contextMemory.ongoingProjects;
    if (ongoingProjects.length > 0 && request.context) {
      result = this.addProjectContext(result, ongoingProjects, request.context);
    }
    
    return result;
  }
  
  // 스타일 변환 구체적 구현들
  private static makeContentConcise(content: string): string {
    return content
      .replace(/매우\s+/g, '')
      .replace(/정말로\s+/g, '')
      .replace(/사실\s+/g, '')
      .replace(/\s*,\s*그리고\s*/g, ', ')
      .split('. ')
      .map(sentence => sentence.split(' ').slice(0, 12).join(' '))
      .join('. ');
  }
  
  private static expandContent(content: string): string {
    return content
      .replace(/좋/g, '정말 좋')
      .replace(/해보세요/g, '시도해보시면 좋을 것 같아요')
      .replace(/입니다/g, '입니다. 이는 매우 중요한 부분이에요')
      .replace(/\./g, '. 더 구체적으로 말씀드리면,');
  }
  
  private static makeFormal(content: string): string {
    return content
      .replace(/해요/g, '합니다')
      .replace(/이에요/g, '입니다')
      .replace(/거예요/g, '것입니다')
      .replace(/\!/g, '.')
      .replace(/그냥/g, '단순히')
      .replace(/좀/g, '조금');
  }
  
  private static makeCasual(content: string): string {
    return content
      .replace(/합니다/g, '해요')
      .replace(/입니다/g, '이에요')
      .replace(/것입니다/g, '거예요')
      .replace(/조금/g, '좀')
      .replace(/단순히/g, '그냥');
  }
  
  private static addEnthusiasm(content: string): string {
    return content
      .replace(/좋/g, '정말 좋')
      .replace(/\./g, '!')
      .replace(/네/g, '네!')
      .replace(/해보세요/g, '꼭 해보세요!');
  }
  
  private static reduceEnthusiasm(content: string): string {
    return content
      .replace(/!/g, '.')
      .replace(/정말\s+/g, '')
      .replace(/꼭\s+/g, '')
      .replace(/완전\s+/g, '');
  }
  
  private static makeMoreDirect(content: string): string {
    return content
      .replace(/아마/g, '')
      .replace(/혹시/g, '')
      .replace(/좀/g, '')
      .replace(/생각합니다/g, '확신합니다')
      .replace(/것 같아요/g, '것이 맞아요');
  }
  
  private static makeMoreIndirect(content: string): string {
    return content
      .replace(/해야 합니다/g, '해보시면 좋을 것 같아요')
      .replace(/확실히/g, '아마')
      .replace(/입니다/g, '인 것 같아요')
      .replace(/맞습니다/g, '맞는 것 같습니다');
  }
  
  private static addPoliteness(content: string): string {
    return content
      .replace(/해보세요/g, '해보시기 바랍니다')
      .replace(/주세요/g, '주시면 감사하겠습니다')
      .replace(/생각해보세요/g, '고려해보시기 바랍니다');
  }
  
  private static createVocabularyMap(frequentWords: string[]): { [key: string]: string } {
    // 표준 단어를 사용자가 자주 쓰는 단어로 매핑
    const map: { [key: string]: string } = {};
    
    const synonymGroups = {
      '좋은': ['훌륭한', '멋진', '대단한', '완벽한'],
      '방법': ['방식', '전략', '접근법', '노하우'],
      '중요한': ['핵심', '주요한', '필수적인', '중차대한'],
      '도움': ['지원', '도움말', '가이드', '조언']
    };
    
    frequentWords.forEach(word => {
      Object.entries(synonymGroups).forEach(([standard, synonyms]) => {
        if (synonyms.includes(word)) {
          map[standard] = word;
        }
      });
    });
    
    return map;
  }
  
  private static replaceConjunctions(content: string, preferredConjunctions: string[]): string {
    const conjunctionMap: { [key: string]: string } = {
      '하지만': preferredConjunctions.includes('그런데') ? '그런데' : '하지만',
      '그리고': preferredConjunctions.includes('또한') ? '또한' : '그리고',
      '따라서': preferredConjunctions.includes('그래서') ? '그래서' : '따라서'
    };
    
    let result = content;
    Object.entries(conjunctionMap).forEach(([original, preferred]) => {
      result = result.replace(new RegExp(original, 'g'), preferred);
    });
    
    return result;
  }
  
  private static addFillers(content: string, preferredFillers: string[]): string {
    if (preferredFillers.length === 0) return content;
    
    const sentences = content.split('. ');
    const filler = preferredFillers[0]; // 가장 자주 사용하는 추임새
    
    return sentences.map((sentence, index) => {
      if (index === 0 && Math.random() < 0.3) {
        return `${filler}, ${sentence}`;
      }
      return sentence;
    }).join('. ');
  }
  
  private static simplifyStructure(content: string): string {
    return content
      .split(/[,;]/)
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .join('. ');
  }
  
  private static complexifyStructure(content: string): string {
    const sentences = content.split('. ');
    return sentences.map(sentence => {
      if (sentence.length < 50) {
        return sentence + ', 이는 매우 중요한 포인트입니다';
      }
      return sentence;
    }).join('. ');
  }
  
  private static applyPreferredEndings(content: string, endings: { [ending: string]: number }): string {
    const topEnding = Object.entries(endings).sort(([,a], [,b]) => b - a)[0];
    if (!topEnding) return content;
    
    const preferredEnding = topEnding[0];
    return content.replace(/요$/g, preferredEnding);
  }
  
  private static addAppropriateEmojis(content: string, preferredEmojis: string[]): string {
    if (preferredEmojis.length === 0) return content;
    
    let result = content;
    
    // 문장 끝에 이모지 추가 (30% 확률)
    if (Math.random() < 0.3) {
      const emoji = preferredEmojis[Math.floor(Math.random() * preferredEmojis.length)];
      result = result.trim() + ` ${emoji}`;
    }
    
    // 긍정적 단어 뒤에 이모지 추가
    const positiveWords = ['좋', '훌륭', '완벽', '성공', '최고'];
    positiveWords.forEach(word => {
      if (result.includes(word) && preferredEmojis.includes('👍')) {
        result = result.replace(word, `${word} 👍`);
      }
    });
    
    return result;
  }
  
  private static addExclamations(content: string): string {
    return content
      .replace(/\. ([가-힣]+(?:요|다))$/g, '! $1!')
      .replace(/(정말|진짜|완전)\s+([가-힣]+)/g, '$1 $2!');
  }
  
  private static addEllipsis(content: string): string {
    const sentences = content.split('. ');
    return sentences.map((sentence, index) => {
      if (index === sentences.length - 1 && Math.random() < 0.4) {
        return sentence.replace(/\.$/, '...');
      }
      return sentence;
    }).join('. ');
  }
  
  private static addBrackets(content: string): string {
    const explanatoryPhrases = ['예를 들어', '즉', '다시 말해'];
    let result = content;
    
    explanatoryPhrases.forEach(phrase => {
      result = result.replace(phrase, `(${phrase})`);
    });
    
    return result;
  }
  
  private static incorporateMotivation(content: string, motivationFactors: string[]): string {
    if (motivationFactors.length === 0) return content;
    
    const motivationalPhrases = [
      '성장을 위해',
      '목표 달성을 위해',
      '더 나은 결과를 위해'
    ];
    
    const relevantMotivation = motivationFactors.find(factor => 
      motivationalPhrases.some(phrase => phrase.includes(factor))
    );
    
    if (relevantMotivation) {
      return `${relevantMotivation}을 고려하여, ${content}`;
    }
    
    return content;
  }
  
  private static incorporatePreferences(content: string, preferences: any[]): string {
    // 개인적 선호도 반영 로직
    const relevantPreference = preferences.find(pref => 
      content.toLowerCase().includes(pref.content.substring(0, 10).toLowerCase())
    );
    
    if (relevantPreference && relevantPreference.type === 'preference') {
      return content + ` (이전에 말씀하신 선호도를 고려했습니다)`;
    }
    
    return content;
  }
  
  private static addProjectContext(content: string, projects: any[], context: string): string {
    const relevantProject = projects.find(project => 
      context.toLowerCase().includes(project.name.toLowerCase())
    );
    
    if (relevantProject) {
      return content + ` 진행 중이신 ${relevantProject.name} 프로젝트와 연관지어 보면 더욱 효과적일 것 같아요.`;
    }
    
    return content;
  }
  
  // 신뢰도 계산
  private static calculateConfidenceScore(masterProfile: MasterUserProfile, request: WritingRequest): number {
    let score = 0;
    
    // 데이터 풍부도 기반 (40점)
    score += Math.min(40, masterProfile.profileQuality.dataRichness * 0.4);
    
    // 메시지 분석 수 기반 (30점)
    score += Math.min(30, masterProfile.writingStyle.totalMessagesAnalyzed * 0.6);
    
    // 일관성 점수 기반 (20점)
    score += Math.min(20, masterProfile.profileQuality.consistencyScore * 0.2);
    
    // 요청 복잡도에 따른 조정 (10점)
    if (request.purpose === 'response') score += 10;
    else if (request.purpose === 'suggestion') score += 5;
    
    return Math.round(score);
  }
  
  // 스타일 적용 로그 생성
  private static generateStyleApplicationLog(
    original: string, 
    personalized: string, 
    style: WritingStyleProfile
  ): PersonalizedWritingResult['styleApplication'] {
    
    const toneAdjustments: string[] = [];
    const vocabularyMatches: string[] = [];
    const patternApplications: string[] = [];
    const structuralChanges: string[] = [];
    
    // 어투 조정 로그
    if (style.tone.formality > 70) toneAdjustments.push('격식체 적용');
    if (style.tone.enthusiasm > 70) toneAdjustments.push('열정적 어투 적용');
    if (style.tone.directness > 70) toneAdjustments.push('직설적 표현 적용');
    if (style.tone.politeness > 70) toneAdjustments.push('정중한 표현 적용');
    
    // 어휘 매칭 로그
    Object.keys(style.frequentWords).slice(0, 5).forEach(word => {
      if (personalized.includes(word)) {
        vocabularyMatches.push(`"${word}" 사용자 선호 어휘 적용`);
      }
    });
    
    // 패턴 적용 로그
    if (style.writingPatterns.usesEmojis && /[\u{1F300}-\u{1F9FF}]/u.test(personalized)) {
      patternApplications.push('이모지 패턴 적용');
    }
    if (style.writingPatterns.usesExclamation && personalized.includes('!')) {
      patternApplications.push('느낌표 사용 패턴 적용');
    }
    if (style.writingPatterns.usesEllipsis && personalized.includes('...')) {
      patternApplications.push('말줄임표 패턴 적용');
    }
    
    // 구조적 변화 로그
    if (original.length !== personalized.length) {
      const change = personalized.length > original.length ? '확장' : '압축';
      structuralChanges.push(`문장 길이 ${change} (${Math.abs(personalized.length - original.length)}자)`);
    }
    
    return {
      toneAdjustments,
      vocabularyMatches,
      patternApplications,
      structuralChanges
    };
  }
  
  // 대안 생성
  private static generateAlternatives(request: WritingRequest, masterProfile: MasterUserProfile): string[] {
    // 재귀 방지를 위해 generateAlternatives가 false인 경우 빈 배열 반환
    if (request.generateAlternatives === false) {
      return [];
    }
    
    const alternatives: string[] = [];
    
    // 다른 톤으로 생성 (재귀 방지 플래그 설정)
    if (request.tone !== 'professional') {
      try {
        const professionalRequest = { ...request, tone: 'professional' as const, generateAlternatives: false };
        const professionalResult = this.generatePersonalizedContent(professionalRequest, masterProfile);
        alternatives.push(professionalResult.personalizedContent);
      } catch (error) {
        console.warn('Professional alternative generation failed:', error);
      }
    }
    
    if (request.tone !== 'casual') {
      try {
        const casualRequest = { ...request, tone: 'casual' as const, generateAlternatives: false };
        const casualResult = this.generatePersonalizedContent(casualRequest, masterProfile);
        alternatives.push(casualResult.personalizedContent);
      } catch (error) {
        console.warn('Casual alternative generation failed:', error);
      }
    }
    
    return alternatives.slice(0, 2); // 최대 2개 대안
  }
}