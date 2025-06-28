# 🔄 Learning Data 마이그레이션 가이드

기존 파일 시스템 기반의 `learning-data` 폴더 데이터를 새로운 PostgreSQL 데이터베이스로 마이그레이션하는 가이드입니다.

## 📁 기존 데이터 구조

```
learning-data/
├── profile-temp_user_id.json        # 사용자 프로필 데이터
├── user-profile-temp_user_id.json   # 학습된 사용자 선호도
├── feedback-log.json                # 메시지 피드백 로그
├── learning-insights.json           # AI 학습 인사이트
└── conversation-log.json            # 대화 기록
```

## 🚀 마이그레이션 단계

### 1. 환경 준비

```bash
# 필요한 의존성 설치
npm install

# 데이터베이스 스키마 생성
npx prisma db push

# 또는 마이그레이션 파일 생성
npx prisma migrate dev --name init
```

### 2. 데이터 백업

```bash
# 기존 데이터 안전하게 백업
npm run backup:data
```

이 명령어는:
- `learning-data` 폴더를 `learning-data-backup-YYYYMMDD_HHMMSS` 형태로 백업
- 백업 완료 후 원본 폴더 삭제 여부 선택

### 3. 데이터 마이그레이션

```bash
# 파일 데이터를 PostgreSQL로 마이그레이션
npm run migrate:data
```

이 명령어는:
- 임시 사용자 계정 생성 (`temp_user@taskgenius.com`)
- 프로필 데이터 → `extended_profiles` 테이블
- 피드백 데이터 → `message_feedbacks` 테이블
- 학습 인사이트 → `learning_insights` 테이블
- 대화 기록 → `conversations` & `messages` 테이블

### 4. 마이그레이션 확인

```bash
# Prisma Studio로 데이터 확인
npx prisma studio
```

브라우저에서 `http://localhost:5555`로 접속하여 마이그레이션된 데이터를 확인할 수 있습니다.

## 📊 마이그레이션되는 데이터

### 사용자 프로필
- 비즈니스 정보 (업종, 매출 등)
- 완성도 점수
- 마지막 업데이트 시간

### 피드백 데이터
- 메시지별 사용자 피드백 (helpful/not_helpful/very_helpful)
- 피드백 타임스탬프
- 페르소나 정보

### 학습 인사이트
- AI 학습 패턴
- 신뢰도 점수
- 카테고리별 분류

### 대화 기록
- 메시지 내용 및 순서
- 페르소나 정보
- 제안 사항

## ⚠️ 주의사항

1. **데이터 백업**: 마이그레이션 전 반드시 백업을 수행하세요
2. **환경 변수**: `.env` 파일에 올바른 `DATABASE_URL`이 설정되어 있는지 확인
3. **임시 사용자**: 마이그레이션으로 생성된 임시 사용자는 실제 운영에서 관리가 필요
4. **대용량 데이터**: 피드백 로그가 큰 경우 마이그레이션 시간이 오래 걸릴 수 있음

## 🔧 문제 해결

### 마이그레이션 실패 시
```bash
# 데이터베이스 초기화
npx prisma db push --force-reset

# 다시 마이그레이션 실행
npm run migrate:data
```

### 부분적 마이그레이션
스크립트는 오류가 발생해도 가능한 데이터를 최대한 마이그레이션하도록 설계되었습니다. 콘솔 로그를 확인하여 어떤 데이터가 마이그레이션되었는지 확인하세요.

## 🎯 다음 단계

1. **실제 사용자 등록**: 새로운 사용자들은 OAuth/이메일을 통해 가입
2. **기존 데이터 연결**: 필요시 임시 사용자 데이터를 실제 사용자와 연결
3. **백업 데이터 정리**: 마이그레이션 완료 후 백업 폴더 정리

## 📞 지원

마이그레이션 과정에서 문제가 발생하면:
- 콘솔 로그 확인
- `prisma studio`로 데이터 상태 점검
- 백업에서 데이터 복구 가능