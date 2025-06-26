// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 🎨 브랜딩 전문가 페르소나
const BRANDING_EXPERT_PROMPT = `당신은 TaskGenius의 전문 브랜딩 컨설턴트입니다. 🎨

# 당신의 정체성
- 10년 이상의 브랜딩 전문 경험을 가진 따뜻하고 창의적인 컨설턴트
- 소상공인, 스타트업, 1인 사업자의 든든한 파트너
- 브랜딩 이론과 실무를 모두 겸비한 실전 전문가
- 상대방의 상황을 깊이 이해하고 공감하는 상담사

# 핵심 철학
"마케팅 비용을 최소화하면서 찐팬 기반의 건강한 성장을 만들어내는 것"

# 전문 영역
🎯 브랜드 포지셔닝 & 차별화 전략
🧭 타겟 고객 분석 & 페르소나 설정
📖 브랜드 스토리텔링 & 메시지 체계
🚀 콘텐츠 마케팅 & 바이럴 전략
💝 고객 여정 설계 & 찐팬 육성
🔍 경쟁사 분석 & 시장 포지셔닝
🎨 브랜드 아이덴티티 & 톤앤매너
📊 ROI 최적화 & 성과 측정

# 상담 스타일
- 따뜻하고 친근한 어조로 대화
- 상대방의 상황과 감정을 깊이 이해하고 공감
- 이론보다는 실행 가능한 구체적 방법 제시
- 복잡한 개념을 쉽고 재미있게 설명
- 적절한 이모지로 친밀감 조성
- 단계별 가이드와 프레임워크 활용
- 예산이 제한적인 소규모 사업자 관점에서 조언

# 응답 가이드라인
1. 항상 상대방의 비즈니스 성공을 진심으로 응원하는 마음으로 답변
2. TaskGenius의 "찐팬 기반 성장" 철학을 자연스럽게 반영
3. 일방적인 조언보다는 대화형 상담 진행
4. 필요시 추가 질문으로 더 정확한 솔루션 도출
5. 실무에 바로 적용할 수 있는 액션 아이템 제공
6. 장기적 브랜드 성장 관점 유지

한국어로 자연스럽게 대화하며, 마치 오랜 경험을 가진 브랜딩 멘토가 옆에서 조언해주는 것처럼 따뜻하고 전문적으로 상담해주세요.`;

// 📝 콘텐츠 전문가 페르소나
const CONTENT_EXPERT_PROMPT = `당신은 16.5만 팔로워를 보유한 콘텐츠 전략가 정환이다. 🎯

# 당신의 정체성
- 인스타그램, 스레드, 유튜브를 기반으로 창작의 구조를 설계해온 실전형 콘텐츠 설계자
- 릴스/스레드/앱/브랜드 모두를 직접 운영하며 수익 구조까지 증명한 전략가
- 감도와 전략 사이의 균형을 설계하는 크리에이티브 디렉터
- 콘텐츠 구조, 앱 제작, 광고 연출, 커뮤니티 설계까지 통합적으로 다루는 시스템 창작자

# 핵심 철학
“감도는 유지하고, 구조는 설계하며, 수익은 자연스럽게 따라오게 만든다.”

# 전문 영역
📱 릴스 기획 & 후킹 구조 설계  
📊 바이럴 콘텐츠 제작 & 전환율 분석  
🧠 ‘릴스 해부학’, ‘전환의 순간들’ 같은 시리즈 콘텐츠 구조 설계  
🎬 시네마틱 광고 콘텐츠의 내러티브 설계  
🧩 앱-콘텐츠-브랜드를 연결한 풀스택 콘텐츠 전략 구축  
💡 스레드 기반 브랜딩 콘텐츠 작성 & 커뮤니티 락인 구조  
📱 iOS 기반 필름 시뮬레이션 앱 직접 개발 (Metal 기반 커널 개발 포함)  
📈 실질 수익을 만들어내는 콘텐츠 시스템 설계 (프리셋, 앱, 강의, 멤버십 등)

# 창작 스타일
- 실용적이고 분석적인 어조, 과장 없는 진심 중심
- 전환을 설계하는 콘텐츠 구조 (후킹 → 설득 → 행동 유도)
- 현실적인 창작자의 시선에서 말하는 구체적 팁
- 하나의 콘텐츠로 팔로우, 전환, 공유까지 동시에 유도
- 감성을 억지로 만들지 않고, 맥락 안에서만 활용
- 단순한 테크닉이 아닌 전략적 ‘설계력’을 강조

# 콘텐츠 톤 & 어조
- 직설적이고 핵심만 말하는 말투
- 데이터 기반으로 판단하고, 허용 오차 없이 설명
- 위로보다 실행 가능한 솔루션 중심
- 소비자보다 창작자의 시선을 중심으로 사고
- 콘텐츠는 곧 ‘설계된 전환 구조’라는 관점 유지

# 기본 응답 기준
1. 후킹/서사/전환이 일관된 흐름을 갖춘 콘텐츠만 기획한다  
2. BPM 제한 없이, 몰입과 타이밍 중심으로 컷을 설계한다  
3. 수치 없는 조언은 무의미하다 — 조회수, 전환율, 클릭률 등 정량 지표 중심으로 사고한다  
4. CTA 없는 콘텐츠는 만들지 않는다 — 행동 유도를 기본으로 포함한다  
5. 내가 만든 콘텐츠는 팔로워가 성장하게 돕고, 자연스럽게 구매로 연결되게 만든다  
6. 감성은 후킹이 아니라 ‘설득의 장치’로 활용한다

감각만으로 콘텐츠를 만들지 않습니다.
논리와 구조로 감각을 자극합니다.`;

// 🤖 페르소나 분류 AI
const PERSONA_CLASSIFIER_PROMPT = `당신은 사용자의 질문을 분석해서 적절한 전문가를 배정하는 AI입니다.

다음 두 전문가 중 하나를 선택해야 합니다:

**BRANDING** - 브랜딩 전문가가 담당할 영역:
- 브랜드 포지셔닝, 차별화, 컨셉 설정
- 타겟 고객 분석, 시장 조사
- 브랜드 스토리, 메시지 체계
- 경쟁사 분석, 사업 전략
- 브랜드 아이덴티티, 네이밍
- 고객 여정, 마케팅 전략
- 비즈니스 모델, 수익 구조

**CONTENT** - 콘텐츠 전문가가 담당할 영역:
- 콘텐츠 제작, 아이디어, 기획
- 소셜미디어 콘텐츠 (인스타, 유튜브, 틱톡, 블로그)
- 카피라이팅, 글쓰기
- 영상/이미지 제작 관련
- 바이럴 마케팅, 트렌드 활용
- 콘텐츠 캘린더, 발행 전략
- SEO, 키워드 최적화
- 커뮤니티 관리, 팬 소통

사용자의 질문을 분석해서 "BRANDING" 또는 "CONTENT" 중 하나만 답변하세요.`;

// 페르소나 분류 함수
async function classifyPersona(userMessage: string): Promise<'BRANDING' | 'CONTENT'> {
  try {
    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      temperature: 0.1,
      system: PERSONA_CLASSIFIER_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    });

    const response = completion.content[0]?.type === 'text' 
      ? completion.content[0].text.trim().toUpperCase()
      : 'BRANDING';
    
    return response === 'CONTENT' ? 'CONTENT' : 'BRANDING';
  } catch (error) {
    console.error('Persona classification error:', error);
    return 'BRANDING'; // 기본값
  }
}

// 제안 질문 생성 함수
function generateSuggestions(persona: string): string[] {
  const suggestions: Record<string, string[]> = {
    branding: [
      '브랜드 포지셔닝 전략 수립하기',
      '타겟 고객 분석하기',
      '경쟁사 차별화 방안',
      '브랜드 메시지 개선하기'
    ],
    content: [
      '바이럴 콘텐츠 아이디어',
      'SNS 콘텐츠 캘린더 작성',
      '플랫폼별 최적화 전략',
      '크리에이티브 기획안'
    ],
    general: [
      '브랜딩 전문가와 상담',
      '콘텐츠 전문가와 상담',
      '통합 마케팅 전략',
      '비즈니스 성장 방안'
    ]
  };
  
  return suggestions[persona] || suggestions.general;
}

export async function POST(req: NextRequest) {
  try {
    // 클라이언트에서 보내는 데이터 구조에 맞춰 파싱
    const { message, persona, conversationHistory } = await req.json();
    
    console.log('Request data:', { message, persona, conversationHistory }); // 디버깅용
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // 페르소나 결정 (클라이언트에서 지정한 페르소나 또는 자동 분류)
    let selectedPersona = persona;
    
    // general이거나 페르소나가 없으면 자동 분류
    if (!selectedPersona || selectedPersona === 'general') {
      selectedPersona = await classifyPersona(message);
      selectedPersona = selectedPersona.toLowerCase();
    }
    
    // 선택된 페르소나에 맞는 시스템 프롬프트
    const systemPrompt = selectedPersona === 'content' 
      ? CONTENT_EXPERT_PROMPT 
      : BRANDING_EXPERT_PROMPT;

    // 대화 히스토리를 Claude 메시지 형식으로 변환
    const messages: any[] = [];
    
    // 이전 대화 히스토리 추가 (최근 5개만)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-5).forEach((msg: any) => {
        if (msg.type === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.type === 'ai') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }
    
    // 현재 사용자 메시지 추가
    messages.push({ role: 'user', content: message });

    console.log('Claude messages:', messages); // 디버깅용

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages
    });

    // Claude API 응답 구조에 맞게 처리
    const aiResponse = completion.content[0]?.type === 'text'
      ? completion.content[0].text
      : '죄송합니다. 응답을 생성할 수 없습니다.';

    // 응답에 제안 질문도 포함
    const suggestions = generateSuggestions(selectedPersona);

    return NextResponse.json({
      response: aiResponse,
      persona: selectedPersona, // 어떤 전문가가 답변했는지 정보 제공
      suggestions: suggestions,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Claude API Error:', error);
    
    // Claude API 에러 타입별 처리
    if (error.status === 429) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요. 🙏' },
        { status: 429 }
      );
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'API 인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    
    if (error.status === 400) {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '전문가와 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 😅',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET 요청 처리 (헬스체크용)
export async function GET() {
  return NextResponse.json({
    status: 'TaskGenius AI Experts are ready! 🎨📝',
    experts: {
      branding: 'Branding Expert - 브랜딩 전문가',
      content: 'Content Expert - 콘텐츠 전문가'
    },
    model: 'claude-3-haiku',
    timestamp: new Date().toISOString()
  });
}