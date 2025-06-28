# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1단계: 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단에서 "프로젝트 선택" 클릭
3. "새 프로젝트" 버튼 클릭
4. 프로젝트 이름 입력 (예: "TaskGenius-Auth")
5. "만들기" 클릭

### 2단계: OAuth 동의 화면 설정
1. 좌측 메뉴에서 "API 및 서비스" > "OAuth 동의 화면" 선택
2. "외부" 선택 후 "만들기" 클릭
3. 필수 정보 입력:
   - 앱 이름: TaskGenius
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. "저장 후 계속" 클릭
5. 범위는 기본값 그대로 두고 "저장 후 계속" 클릭
6. 테스트 사용자에 본인 이메일 추가 후 "저장 후 계속" 클릭

### 3단계: OAuth 클라이언트 ID 생성
1. 좌측 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
2. 상단 "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 클릭
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 이름: "TaskGenius Web Client"
5. 승인된 JavaScript 출처:
   - http://localhost:3000
   - http://localhost:3001
6. 승인된 리디렉션 URI:
   - http://localhost:3000/api/auth/callback/google
   - http://localhost:3001/api/auth/callback/google
7. "만들기" 클릭

### 4단계: 클라이언트 ID와 비밀번호 복사
생성 완료 후 나타나는 팝업에서:
- 클라이언트 ID 복사
- 클라이언트 비밀번호 복사

## 2. 환경 변수 설정

위에서 복사한 값들을 .env.local 파일에 설정하세요.

## 3. 테스트

설정 완료 후:
1. 개발 서버 재시작: `npm run dev`
2. http://localhost:3000/auth/signin 접속
3. "Google로 계속하기" 버튼 클릭하여 테스트

## 주의사항

- 개발 환경에서는 localhost 도메인만 사용 가능
- 프로덕션 배포 시 실제 도메인으로 리디렉션 URI 추가 필요
- 클라이언트 비밀번호는 절대 공개하면 안됨