# Google OAuth 설정 체크리스트

## 🔥 빠른 설정 가이드

### ✅ 체크리스트

#### 1단계: 프로젝트 생성
- [ ] Google Cloud Console 접속 (console.cloud.google.com)
- [ ] 새 프로젝트 생성
- [ ] 프로젝트 이름: "TaskGenius-Auth"

#### 2단계: OAuth 동의 화면
- [ ] API 및 서비스 > OAuth 동의 화면
- [ ] 사용자 유형: "외부" 선택
- [ ] 앱 이름: "TaskGenius"
- [ ] 사용자 지원 이메일: 본인 이메일
- [ ] 개발자 연락처: 본인 이메일
- [ ] 테스트 사용자에 본인 이메일 추가

#### 3단계: OAuth 클라이언트 ID 생성
- [ ] API 및 서비스 > 사용자 인증 정보
- [ ] 사용자 인증 정보 만들기 > OAuth 클라이언트 ID
- [ ] 애플리케이션 유형: "웹 애플리케이션"
- [ ] 이름: "TaskGenius Web Client"

#### 4단계: 승인된 URI 설정
**승인된 JavaScript 출처:**
- [ ] http://localhost:3000
- [ ] http://localhost:3001

**승인된 리디렉션 URI:**
- [ ] http://localhost:3000/api/auth/callback/google
- [ ] http://localhost:3001/api/auth/callback/google

#### 5단계: 환경 변수 설정
- [ ] 클라이언트 ID 복사
- [ ] 클라이언트 보안 비밀번호 복사
- [ ] .env.local 파일에 설정:
  ```
  GOOGLE_CLIENT_ID=복사한_값
  GOOGLE_CLIENT_SECRET=복사한_값
  ```

#### 6단계: 테스트
- [ ] `npm run check:oauth` 실행
- [ ] `npm run dev` 서버 재시작
- [ ] http://localhost:3000/auth/signin 접속
- [ ] Google 로그인 버튼 테스트

## 🚨 주의사항

1. **정확한 URI 입력**: 슬래시(/) 하나라도 틀리면 오류 발생
2. **테스트 사용자 추가**: 본인 이메일을 반드시 테스트 사용자에 추가
3. **환경 변수 재시작**: .env.local 수정 후 반드시 서버 재시작
4. **보안**: 클라이언트 시크릿은 절대 공개하지 말 것

## 📞 도움이 필요한 경우

설정 중 문제가 발생하면:
1. 체크리스트 다시 확인
2. 터미널에서 `npm run check:oauth` 실행
3. 브라우저 개발자 도구에서 오류 메시지 확인
4. detailed-google-oauth-setup.md 문서 참조