# business-task-manager
AI-powered task management SaaS for business owners
# 🚀 Business Task Manager

> AI-powered task management SaaS for business owners

## 📋 프로젝트 개요

사업자들을 위한 AI 기반 태스크 매니징 도구입니다. 개인화된 페르소나 시스템을 통해 브랜딩 컨설턴트와 콘텐츠 전문가의 조언을 제공하며, 일일 업무를 최적화합니다.

## 🛠 기술 스택

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel
- **Authentication**: Supabase Auth

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 레포지토리 클론
git clone https://github.com/your-username/business-task-manager.git
cd business-task-manager

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어서 실제 값들을 입력하세요
```

### 2. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# (선택사항) Prisma Studio 실행
npm run db:studio
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)를 열어보세요.

## 📁 프로젝트 구조

```
business-task-manager/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── dashboard/         # 대시보드 페이지
│   ├── chat/              # AI 컨설턴트 챗
│   ├── tasks/             # 태스크 관리
│   ├── insights/          # 인사이트 분석
│   ├── api/               # API 라우트
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   ├── auth/              # 인증 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   ├── chat/              # 챗봇 컴포넌트
│   └── tasks/             # 태스크 관련 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── prisma.ts          # Prisma 클라이언트
│   ├── supabase.ts        # Supabase 클라이언트
│   ├── openai.ts          # OpenAI 클라이언트
│   └── utils.ts           # 유틸리티 함수
├── prisma/                # 데이터베이스 스키마
│   └── schema.prisma      # Prisma 스키마
├── public/                # 정적 파일
└── types/                 # TypeScript 타입 정의
```

## 🎯 현재 개발 상태

### ✅ 완료된 기능
- [ ] 프로젝트 초기 설정
- [ ] 기본 인증 시스템
- [ ] 사용자 온보딩
- [ ] 대시보드 기본 구조

### 🔄 진행 중인 기능
- [ ] AI 태스크 추천 엔진
- [ ] 컨설턴트 챗봇 시스템
- [ ] 태스크 추적 시스템

### 📋 예정된 기능
- [ ] 콘텐츠 인사이트 분석
- [ ] 캘린더 통합
- [ ] 정부지원사업 추천
- [ ] 외주 매칭 플랫폼

## 🔧 개발 가이드

### 환경 변수 설정

필요한 환경 변수들:

1. **Supabase 설정**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon 키
   - `DATABASE_URL`: 데이터베이스 연결 문자열

2. **OpenAI 설정**
   - `OPENAI_API_KEY`: OpenAI API 키

### 데이터베이스 관리

```bash
# 스키마 변경 후 적용
npm run db:push

# Prisma Studio로 데이터 확인
npm run db:studio
```

### 코드 스타일

- TypeScript 사용 (strict mode)
- ESLint + Prettier 설정
- Tailwind CSS 유틸리티 클래스 사용

## 🚀 배포

### Vercel 배포

1. GitHub와 Vercel 연결
2. 환경변수 설정
3. 자동 배포 완료

### 환경변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경변수들을 설정하세요:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## 📊 성능 모니터링

- Vercel Analytics 활용
- Supabase 대시보드 모니터링
- OpenAI 사용량 추적

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🔗 링크

- [프로젝트 로드맵](./docs/roadmap.md)
- [API 문서](./docs/api.md)
- [개발자 가이드](./docs/development.md)

---

**개발 시작일**: 2025년 6월 26일  
**현재 버전**: 0.1.0  
**상태**: 🚧 개발 중
