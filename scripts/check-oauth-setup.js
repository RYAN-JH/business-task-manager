#!/usr/bin/env node

// Google OAuth 설정 확인 스크립트
console.log('🔍 Google OAuth 설정 확인 중...\n');

// 환경 변수 수동 로드
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!key.startsWith('#') && key.trim()) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
} catch (error) {
  console.log('⚠️ .env.local 파일을 읽을 수 없습니다.');
}

const requiredEnvVars = {
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
};

let allSet = true;

console.log('📋 환경 변수 확인:');
console.log('─'.repeat(50));

for (const [key, value] of Object.entries(requiredEnvVars)) {
  const isSet = value && value !== 'your_google_client_id_here' && value !== 'your_google_client_secret_here';
  const status = isSet ? '✅' : '❌';
  console.log(`${status} ${key}: ${isSet ? '설정됨' : '설정 필요'}`);
  
  if (!isSet) {
    allSet = false;
  }
}

console.log('\n' + '─'.repeat(50));

if (allSet) {
  console.log('🎉 모든 설정이 완료되었습니다!');
  console.log('💡 개발 서버를 재시작하여 Google OAuth를 테스트하세요:');
  console.log('   npm run dev');
} else {
  console.log('⚠️  다음 단계를 완료하세요:');
  console.log('');
  console.log('1. Google Cloud Console에서 OAuth 자격 증명 생성');
  console.log('   https://console.cloud.google.com/');
  console.log('');
  console.log('2. .env.local 파일에 다음 값 설정:');
  if (!requiredEnvVars.GOOGLE_CLIENT_ID || requiredEnvVars.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    console.log('   GOOGLE_CLIENT_ID=your_actual_client_id');
  }
  if (!requiredEnvVars.GOOGLE_CLIENT_SECRET || requiredEnvVars.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
    console.log('   GOOGLE_CLIENT_SECRET=your_actual_client_secret');
  }
  console.log('');
  console.log('📖 자세한 설정 가이드: docs/google-oauth-setup.md');
}

console.log('\n🌐 설정 완료 후 테스트 URL:');
console.log(`   ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`);