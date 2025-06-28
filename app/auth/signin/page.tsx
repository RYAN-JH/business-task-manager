'use client'

import { getProviders, signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function SignIn() {
  const [providers, setProviders] = useState<any>({
    google: {
      id: "google",
      name: "Google",
      type: "oauth"
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setUpProviders = async () => {
      console.log('🔄 Fetching providers...')
      
      // 2초 타임아웃으로 더 빠르게 실패 처리
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      )
      
      try {
        const response = await Promise.race([
          getProviders(),
          timeoutPromise
        ])
        console.log('✅ Providers response:', response)
        setProviders(response || {
          google: {
            id: "google",
            name: "Google",
            type: "oauth"
          }
        })
      } catch (error) {
        console.error('❌ Error fetching providers:', error)
        // 실패 시 기본 설정으로 대체
        setProviders({
          google: {
            id: "google",
            name: "Google",
            type: "oauth"
          }
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    setUpProviders()
  }, [])

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '48px',
      border: '1px solid #d0d0d0',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      maxWidth: '400px',
      width: '100%'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '32px'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: '#2c2c2c',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '18px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '500',
      color: '#2c2c2c'
    },
    title: {
      fontSize: '20px',
      fontWeight: '500',
      color: '#2c2c2c',
      textAlign: 'center' as const,
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666666',
      textAlign: 'center' as const,
      marginBottom: '32px'
    },
    form: {
      marginBottom: '24px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d0d0d0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px',
      outline: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      transition: 'border-color 0.15s ease'
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      backgroundColor: '#2c2c2c',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      marginBottom: '16px'
    },
    googleButton: {
      width: '100%',
      padding: '12px 24px',
      backgroundColor: '#ffffff',
      color: '#2c2c2c',
      border: '1px solid #d0d0d0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    divider: {
      textAlign: 'center' as const,
      margin: '24px 0',
      position: 'relative' as const,
      color: '#666666',
      fontSize: '12px'
    },
    footer: {
      textAlign: 'center' as const,
      fontSize: '12px',
      color: '#666666',
      marginTop: '32px'
    },
    link: {
      color: '#2c2c2c',
      textDecoration: 'none'
    }
  }


  
  if (isLoading) {
    return (
      <div style={styles.container}>
        <LoadingSpinner
          message="OAuth 설정을 확인 중..."
          estimatedTime={2}
          showProgress={true}
          size="medium"
          variant="default"
        />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🧠</div>
          <span style={styles.logoText}>TaskGenius</span>
        </div>
        
        <h1 style={styles.title}>로그인</h1>
        <p style={styles.subtitle}>AI 브랜딩 & 콘텐츠 전략가와 함께하세요</p>

        {providers && providers.google ? (
          <button
            style={styles.googleButton}
            onClick={() => signIn('google', { callbackUrl: '/chat' })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
              e.currentTarget.style.borderColor = '#b0b0b0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d0d0d0'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>Google OAuth 설정이 필요합니다.</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              .env.local 파일에 GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 설정해주세요.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" style={styles.link}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}