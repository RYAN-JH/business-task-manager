# 🔑 페르소나 동기화를 위한 API 설정 가이드

moment.ryan 페르소나를 실제 SNS 계정과 연동하여 자동으로 업데이트하기 위한 API 설정 방법입니다.

## 📱 1. Threads API 설정

### 1.1 Meta for Developers 계정 생성
1. [Meta for Developers](https://developers.facebook.com/) 접속
2. Facebook 계정으로 로그인
3. "내 앱" → "앱 만들기" 클릭

### 1.2 Threads API 앱 설정
1. **앱 유형**: "소비자" 선택
2. **앱 세부정보**:
   - 앱 이름: `moment-ryan-persona-sync`
   - 연락처 이메일: 본인 이메일
3. **제품 추가**: "Threads API" 선택

### 1.3 Threads API 권한 요청
1. **기본 설정** → **앱 ID**, **앱 시크릿** 복사
2. **Threads API** → **설정**:
   - 권한: `threads_basic`, `threads_content_publish`, `threads_manage_insights`
   - 리디렉션 URL: `http://localhost:3000/api/auth/threads/callback`

### 1.4 액세스 토큰 발급
1. **Graph API 탐색기** 사용
2. 사용자 액세스 토큰 생성
3. **장기 액세스 토큰으로 교환**:
   ```bash
   curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
   ```

### 1.5 환경 변수 설정
```env
THREADS_ACCESS_TOKEN=your_long_lived_access_token
THREADS_APP_ID=your_app_id
THREADS_APP_SECRET=your_app_secret
```

---

## 📸 2. Instagram API 설정

### 2.1 Instagram Basic Display API 설정
1. [Meta for Developers](https://developers.facebook.com/apps/) 에서 기존 앱 사용
2. **제품 추가** → "Instagram Basic Display" 선택

### 2.2 Instagram 앱 설정
1. **Instagram Basic Display** → **기본 설정**:
   - 유효한 OAuth 리디렉션 URI: `http://localhost:3000/api/auth/instagram/callback`
   - 사용자 해제 URL: `http://localhost:3000/api/auth/instagram/deauthorize`
   - 데이터 삭제 요청 URL: `http://localhost:3000/api/auth/instagram/delete`

### 2.3 Instagram 테스터 추가
1. **역할** → **역할 추가**
2. Instagram 계정을 "Instagram 테스터"로 추가
3. Instagram 앱에서 테스터 초대 수락

### 2.4 액세스 토큰 발급
1. **브라우저에서 인증 URL 접속**:
   ```
   https://api.instagram.com/oauth/authorize
     ?client_id={app-id}
     &redirect_uri={redirect-uri}
     &scope=user_profile,user_media
     &response_type=code
   ```

2. **인증 코드를 액세스 토큰으로 교환**:
   ```bash
   curl -X POST https://api.instagram.com/oauth/access_token \
     -F client_id={app-id} \
     -F client_secret={app-secret} \
     -F grant_type=authorization_code \
     -F redirect_uri={redirect-uri} \
     -F code={code}
   ```

3. **장기 토큰으로 교환**:
   ```bash
   curl -i -X GET "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret={app-secret}&access_token={short-lived-token}"
   ```

### 2.5 환경 변수 설정
```env
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret
```

---

## 📧 3. 뉴스레터 API 설정

### 3.1 Substack API 설정
1. [Substack](https://substack.com) 계정 로그인
2. **설정** → **개발자** → **API 키 생성**
3. 권한: 읽기 전용 (구독자 수, 게시물 목록)

### 3.2 환경 변수 설정
```env
SUBSTACK_API_KEY=your_substack_api_key
NEWSLETTER_PLATFORM=substack
```

### 3.3 ConvertKit 대안 (만약 ConvertKit 사용시)
1. [ConvertKit](https://convertkit.com) → **설정** → **고급** → **API**
2. **API 시크릿** 복사

```env
CONVERTKIT_API_KEY=your_api_key
CONVERTKIT_API_SECRET=your_api_secret
NEWSLETTER_PLATFORM=convertkit
```

### 3.4 Mailchimp 대안 (만약 Mailchimp 사용시)
1. [Mailchimp](https://mailchimp.com) → **계정** → **엑스트라** → **API 키**
2. **새 키 생성**

```env
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_SERVER_PREFIX=us1
NEWSLETTER_PLATFORM=mailchimp
```

---

## ⚙️ 4. OAuth 설정 (고급 설정)

### 4.1 동적 토큰 갱신을 위한 OAuth 설정
실제 서비스에서는 사용자가 직접 계정을 연결할 수 있도록 OAuth 플로우를 구현합니다.

### 4.2 NextAuth.js 확장
```typescript
// lib/auth.ts에 추가
providers: [
  // 기존 Google provider
  GoogleProvider({...}),
  
  // Instagram provider 추가
  {
    id: "instagram",
    name: "Instagram",
    type: "oauth",
    authorization: "https://api.instagram.com/oauth/authorize",
    token: "https://api.instagram.com/oauth/access_token",
    userinfo: "https://graph.instagram.com/me",
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    // ...추가 설정
  }
]
```

---

## 🧪 5. 테스트 방법

### 5.1 API 연결 테스트
```bash
# 개발 서버 실행
npm run dev

# 페르소나 동기화 테스트
curl -X POST http://localhost:3000/api/persona-sync \
  -H "Content-Type: application/json" \
  -d '{"action": "sync_now"}'
```

### 5.2 수동 테스트
1. 브라우저에서 `http://localhost:3000/dashboard/persona-sync` 접속
2. "지금 동기화" 버튼 클릭
3. 콘솔에서 API 호출 로그 확인

---

## 🚨 주의사항

### 보안
- **API 키는 절대 코드에 하드코딩하지 마세요**
- `.env.local` 파일은 `.gitignore`에 포함되어 있는지 확인
- 프로덕션에서는 환경 변수를 안전하게 관리

### API 제한사항
- **Instagram**: 시간당 200회 요청 제한
- **Threads**: 시간당 100회 요청 제한 (베타)
- **뉴스레터**: 플랫폼별 제한사항 확인

### 토큰 만료
- **단기 토큰**: 1시간 (자동 갱신 구현 필요)
- **장기 토큰**: 60일 (정기 갱신 필요)

---

## 📞 문제 해결

### FAQ
**Q: Threads API 접근이 거부됩니다**
A: Threads API는 현재 베타 상태로, 별도 승인이 필요할 수 있습니다.

**Q: Instagram 토큰이 만료됩니다**
A: 장기 토큰으로 교환했는지 확인하고, 토큰 갱신 로직을 구현하세요.

**Q: 뉴스레터 API가 없습니다**
A: 사용하는 플랫폼의 API 문서를 확인하거나, RSS 피드를 활용하는 대안을 고려하세요.

### 로그 확인
```bash
# 개발 서버 로그 모니터링
npm run dev

# API 호출 로그
tail -f logs/persona-sync.log
```

---

## 🎯 다음 단계

API 설정이 완료되면:
1. **테스트 동기화** 실행
2. **자동 스케줄링** 설정
3. **모니터링 대시보드** 확인
4. **실제 데이터로 페르소나 업데이트** 검증

설정 중 문제가 발생하면 각 플랫폼의 개발자 문서를 참조하거나, 에러 로그를 확인해주세요.