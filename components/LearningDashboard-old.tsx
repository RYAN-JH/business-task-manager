// components/LearningDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, MessageSquare, Target, BarChart3, User, Settings, Save, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface LearningStats {
  totalInteractions: number;
  positiveRate: number;
  averageScore: number;
  personaStats?: {
    [key: string]: {
      count: number;
      averageScore: number;
    };
  };
  lastUpdated: string;
}

interface UserProfile {
  userId: string;
  preferences: {
    preferredPersona: string;
    communicationStyle: string;
    satisfactionTrend: Array<{
      date: string;
      score: number;
    }>;
  };
  interactions: any[];
}

// 🆕 상세 프로필 인터페이스 추가
interface DetailedProfile {
  userId: string;
  lastUpdated: string;
  basicInfo: {
    name: string;
    role: string;
    experienceYears: string;
    companySize: string;
    industry: string;
  };
  businessInfo: {
    businessType: string;
    targetCustomer: string;
    mainProducts: string;
    competitiveAdvantage: string;
    currentChallenges: string[];
    marketPosition: string;
  };
  aiPreferences: {
    preferredPersona: string;
    communicationStyle: string;
    responseLength: string;
    formalityLevel: string;
    includeExamples: boolean;
    includeActionItems: boolean;
  };
  goals: {
    shortTermGoals: string[];
    longTermGoals: string[];
    primaryInterests: string[];
    urgentNeeds: string[];
    successMetrics: string[];
  };
  learningPreferences: {
    feedbackStyle: string;
    learningPace: string;
    preferredTopics: string[];
    avoidTopics: string[];
  };
  brandInfo: {
    brandPersonality: string[];
    brandValues: string[];
    brandVoice: string;
    targetAudience: string;
    brandDifferentiators: string[];
  };
}

const LearningDashboard: React.FC = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // 🆕 상세 프로필 상태 추가
  const [detailedProfile, setDetailedProfile] = useState<DetailedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // 🆕 저장 관련 상태 추가
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // 🆕 프로필 탭 추가
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'profile'>('overview');
  // 🆕 프로필 섹션 상태 추가
  const [profileSection, setProfileSection] = useState<'basic' | 'business' | 'ai' | 'goals' | 'learning' | 'brand'>('basic');

  const userId = 'temp_user_id'; // 임시 사용자 ID

  // 🆕 DetailedProfile을 ExtendedProfile로 역변환하는 함수
  const convertDetailedToExtendedProfile = (detailedProfile: DetailedProfile): any => {
    return {
      userId: detailedProfile.userId,
      lastUpdated: detailedProfile.lastUpdated,
      name: detailedProfile.basicInfo?.name || '',
      businessName: detailedProfile.businessInfo?.mainProducts || detailedProfile.basicInfo?.industry || '',
      businessType: detailedProfile.businessInfo?.businessType || '',
      industry: detailedProfile.basicInfo?.industry || '',
      experienceLevel: detailedProfile.basicInfo?.experienceYears || '',
      goals: detailedProfile.goals?.shortTermGoals || [],
      challenges: detailedProfile.businessInfo?.currentChallenges || [],
      interests: detailedProfile.goals?.primaryInterests || [],
      aiPreferences: detailedProfile.aiPreferences,
      businessOperation: {
        employeeCount: detailedProfile.basicInfo?.companySize?.match(/\d+/)?.[0] 
          ? parseInt(detailedProfile.basicInfo.companySize.match(/\d+/)?.[0] || '0')
          : null,
        growthStage: detailedProfile.businessInfo?.marketPosition || ''
      },
      customerDetails: {
        demographics: detailedProfile.businessInfo?.targetCustomer || ''
      },
      brandIdentity: {
        mission: detailedProfile.brandInfo?.brandVoice || '',
        differentiation: detailedProfile.businessInfo?.competitiveAdvantage || ''
      },
      personalCharacteristics: {
        communicationStyle: detailedProfile.learningPreferences?.feedbackStyle || '',
        learningStyle: detailedProfile.learningPreferences?.learningPace || ''
      },
      goalsStrategy: {
        businessGoals: {
          threeYearVision: detailedProfile.goals?.longTermGoals?.[0] || ''
        }
      },
      completionPercentage: 0 // 계산 필요
    };
  };

  // 🆕 ExtendedProfile을 DetailedProfile로 변환하는 함수
  const convertExtendedToDetailedProfile = (extendedProfile: any): DetailedProfile => {
    return {
      userId: extendedProfile.userId || 'temp_user_id',
      lastUpdated: extendedProfile.lastUpdated || new Date().toISOString(),
      basicInfo: {
        name: extendedProfile.name || '',
        role: extendedProfile.experienceLevel || '',
        experienceYears: extendedProfile.experienceLevel || '',
        companySize: extendedProfile.businessOperation?.employeeCount 
          ? `${extendedProfile.businessOperation.employeeCount}명`
          : '',
        industry: extendedProfile.industry || ''
      },
      businessInfo: {
        businessType: extendedProfile.businessType || '',
        targetCustomer: extendedProfile.customerDetails?.demographics || '',
        mainProducts: extendedProfile.businessName || '',
        competitiveAdvantage: extendedProfile.brandIdentity?.differentiation || '',
        currentChallenges: extendedProfile.challenges || [],
        marketPosition: extendedProfile.businessOperation?.growthStage || ''
      },
      aiPreferences: extendedProfile.aiPreferences || {
        preferredPersona: 'adaptive',
        communicationStyle: 'balanced',
        responseLength: 'medium',
        formalityLevel: 'professional',
        includeExamples: true,
        includeActionItems: true
      },
      goals: {
        shortTermGoals: extendedProfile.goals || [],
        longTermGoals: extendedProfile.goalsStrategy?.businessGoals?.threeYearVision 
          ? [extendedProfile.goalsStrategy.businessGoals.threeYearVision]
          : [],
        primaryInterests: extendedProfile.interests || [],
        urgentNeeds: extendedProfile.challenges || [],
        successMetrics: []
      },
      learningPreferences: {
        feedbackStyle: extendedProfile.personalCharacteristics?.communicationStyle || '',
        learningPace: extendedProfile.personalCharacteristics?.learningStyle || '',
        preferredTopics: extendedProfile.interests || [],
        avoidTopics: []
      },
      brandInfo: {
        brandPersonality: [],
        brandValues: [],
        brandVoice: extendedProfile.brandIdentity?.mission || '',
        targetAudience: extendedProfile.customerDetails?.demographics || '',
        brandDifferentiators: extendedProfile.brandIdentity?.differentiation 
          ? [extendedProfile.brandIdentity.differentiation]
          : []
      }
    };
  };

  useEffect(() => {
    loadLearningData();
    
    // 🆕 5초마다 프로필 데이터 새로고침 (챗봇에서 업데이트된 정보 반영)
    const profileRefreshInterval = setInterval(() => {
      if (activeTab === 'profile') {
        console.log('🔄 프로필 데이터 자동 새로고침...');
        loadLearningData();
      }
    }, 5000);

    return () => clearInterval(profileRefreshInterval);
  }, [activeTab]);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // 전체 통계 로드
      const statsResponse = await fetch('/api/feedback');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 로드된 통계 데이터:', statsData);
        
        // 기본값으로 안전하게 설정
        const safeStats = {
          totalInteractions: statsData.analysis?.total || 0,
          positiveRate: statsData.analysis ? 
            Math.round(((statsData.analysis.helpful + statsData.analysis.veryHelpful) / Math.max(statsData.analysis.total, 1)) * 100) : 0,
          averageScore: 75, // 기본값
          personaStats: statsData.analysis?.byPersona || {},
          lastUpdated: statsData.lastUpdated || new Date().toISOString()
        };
        
        setStats(safeStats);
      } else {
        console.error('통계 데이터 로드 실패:', statsResponse.status);
        // 기본 더미 데이터
        setStats({
          totalInteractions: 0,
          positiveRate: 0,
          averageScore: 0,
          personaStats: {},
          lastUpdated: new Date().toISOString()
        });
      }
      
      // 사용자 프로필 로드
      const profileResponse = await fetch(`/api/feedback?userId=${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // 🆕 상세 프로필 로드 (ExtendedProfile -> DetailedProfile 변환)
      const detailedProfileResponse = await fetch(`/api/profile?userId=${userId}`);
      if (detailedProfileResponse.ok) {
        const extendedProfileData = await detailedProfileResponse.json();
        console.log('📊 로드된 ExtendedProfile:', extendedProfileData);
        
        // ExtendedProfile을 DetailedProfile로 변환
        const convertedProfile = convertExtendedToDetailedProfile(extendedProfileData);
        console.log('🔄 변환된 DetailedProfile:', convertedProfile);
        
        setDetailedProfile(convertedProfile);
      }
      
    } catch (error) {
      console.error('학습 데이터 로드 실패:', error);
      // 에러 발생 시 기본 데이터 설정
      setStats({
        totalInteractions: 0,
        positiveRate: 0,
        averageScore: 0,
        personaStats: {},
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // 🆕 프로필 저장 함수 (DetailedProfile -> ExtendedProfile로 변환하여 저장)
  const saveProfile = async () => {
    if (!detailedProfile) return;
    
    try {
      setSaving(true);
      setSaveStatus('idle');

      // DetailedProfile을 ExtendedProfile로 변환
      const extendedProfileData = convertDetailedToExtendedProfile(detailedProfile);
      console.log('💾 저장할 ExtendedProfile:', extendedProfileData);

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileData: extendedProfileData
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // 🆕 프로필 업데이트 함수
  const updateProfile = (section: keyof DetailedProfile, field: string, value: any) => {
    if (!detailedProfile) return;
    
    setDetailedProfile(prev => ({
      ...prev!,
      [section]: {
        ...(prev![section] as any),
        [field]: value
      }
    }));
  };

  // 🆕 배열 아이템 추가 함수
  const addArrayItem = (section: keyof DetailedProfile, field: string, item: string) => {
    if (!detailedProfile || !item.trim()) return;
    
    setDetailedProfile(prev => ({
      ...prev!,
      [section]: {
        ...(prev![section] as any),
        [field]: [...((prev![section] as any)[field] as string[]), item.trim()]
      }
    }));
  };

  // 🆕 배열 아이템 제거 함수
  const removeArrayItem = (section: keyof DetailedProfile, field: string, index: number) => {
    if (!detailedProfile) return;
    
    setDetailedProfile(prev => ({
      ...prev!,
      [section]: {
        ...(prev![section] as any),
        [field]: ((prev![section] as any)[field] as string[]).filter((_, i) => i !== index)
      }
    }));
  };

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    },
    header: {
      marginBottom: '48px',
      borderBottom: '1px solid #d0d0d0',
      paddingBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '300', // 더 얇은 폰트로 미니멀하게
      color: '#2c2c2c',
      marginBottom: '4px',
      letterSpacing: '-0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '32px',
      fontWeight: '400',
      letterSpacing: '0.01em'
    },
    tabs: {
      display: 'flex',
      gap: '0',
      marginBottom: '48px',
      background: '#ffffff',
      borderRadius: '8px',
      padding: '4px',
      border: '1px solid #d0d0d0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      flexWrap: 'wrap' as const
    },
    tab: (active: boolean) => ({
      padding: '16px 32px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.15s ease',
      background: active ? '#2c2c2c' : 'transparent',
      color: active ? '#ffffff' : '#555555',
      letterSpacing: '0.01em',
      borderRadius: '6px',
      minWidth: '120px',
      textAlign: 'center' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: active ? '0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 'none'
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '32px',
      marginBottom: '48px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '32px',
      border: '1px solid #d0d0d0',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    cardIcon: () => ({
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: '#2c2c2c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }),
    cardTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#2c2c2c',
      letterSpacing: '0.01em'
    },
    metric: {
      fontSize: '28px',
      fontWeight: '300',
      color: '#2c2c2c',
      marginBottom: '8px',
      letterSpacing: '-0.02em'
    },
    metricLabel: {
      fontSize: '13px',
      color: '#666666',
      fontWeight: '400'
    },
    progressBar: () => ({
      width: '100%',
      height: '6px',
      background: '#f0f0f0',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '12px',
      position: 'relative' as const,
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
    }),
    progressFill: (percentage: number) => ({
      width: `${percentage}%`,
      height: '100%',
      background: '#2c2c2c',
      borderRadius: '8px',
      transition: 'width 0.3s ease',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
    }),
    personaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },
    personaCard: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #d0d0d0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    personaName: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#2c2c2c',
      marginBottom: '12px',
      letterSpacing: '0.01em'
    },
    personaStats: {
      fontSize: '13px',
      color: '#666666',
      marginBottom: '8px',
      fontWeight: '400'
    },
    trendChart: {
      display: 'flex',
      alignItems: 'end',
      gap: '4px',
      height: '60px',
      marginTop: '16px'
    },
    trendBar: (height: number) => ({
      flex: 1,
      height: `${height}%`,
      background: '#2c2c2c',
      borderRadius: '4px',
      minHeight: '6px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
    }),
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      fontSize: '14px',
      color: '#666666',
      fontWeight: '400'
    },
    refreshButton: {
      padding: '12px 24px',
      background: '#2c2c2c',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.01em',
      transition: 'all 0.15s ease',
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    homeButton: {
      padding: '12px 24px',
      background: '#ffffff',
      color: '#2c2c2c',
      border: '1px solid #d0d0d0',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.01em',
      transition: 'all 0.15s ease',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    // 🆕 프로필 관련 스타일 추가
    saveButton: {
      padding: '16px 32px',
      background: saving ? '#9ca3af' : '#2c2c2c',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: saving ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.15s ease',
      letterSpacing: '0.01em',
      boxShadow: saving ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    profileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      padding: '24px 0',
      borderBottom: '1px solid #d0d0d0'
    },
    profileTitle: {
      fontSize: '20px',
      fontWeight: '400',
      color: '#2c2c2c',
      margin: '0',
      letterSpacing: '0.01em'
    },
    profileActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    },
    lastUpdated: {
      fontSize: '11px',
      color: '#666666',
      fontWeight: '400'
    },
    profileSections: {
      display: 'flex',
      gap: '0',
      marginBottom: '32px',
      background: '#ffffff',
      border: '1px solid #d0d0d0',
      borderRadius: '8px',
      padding: '4px',
      flexWrap: 'wrap' as const,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    sectionTab: (active: boolean) => ({
      padding: '12px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.15s ease',
      background: active ? '#2c2c2c' : 'transparent',
      color: active ? '#ffffff' : '#555555',
      letterSpacing: '0.01em',
      minWidth: '100px',
      textAlign: 'center' as const,
      boxShadow: active ? '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 'none'
    }),
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#2c2c2c',
      marginBottom: '12px',
      letterSpacing: '0.01em'
    },
    input: {
      width: '100%',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #d0d0d0',
      fontSize: '14px',
      transition: 'border-color 0.15s ease',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
      background: '#ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(0, 0, 0, 0.08)'
    },
    textarea: {
      width: '100%',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #d0d0d0',
      fontSize: '14px',
      minHeight: '96px',
      resize: 'vertical' as const,
      transition: 'border-color 0.15s ease',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
      background: '#ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(0, 0, 0, 0.08)'
    },
    select: {
      width: '100%',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #d0d0d0',
      fontSize: '14px',
      background: '#ffffff',
      transition: 'border-color 0.15s ease',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(0, 0, 0, 0.08)'
    },
    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      marginTop: '8px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #d0d0d0',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '400',
      transition: 'all 0.15s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    tagList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
      marginTop: '8px'
    },
    tag: {
      background: '#2c2c2c',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '400',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.01em',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    removeTag: {
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    addInput: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px'
    },
    statusIndicator: (status: 'idle' | 'success' | 'error') => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '400',
      background: status === 'success' ? '#f0f9f0' : status === 'error' ? '#f9f0f0' : 'transparent',
      color: status === 'success' ? '#2c2c2c' : status === 'error' ? '#cc0000' : '#666666',
      border: status === 'success' ? '1px solid #d0d0d0' : status === 'error' ? '1px solid #d0d0d0' : 'none',
      boxShadow: status !== 'idle' ? '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)' : 'none'
    })
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <Brain className="animate-spin" size={24} style={{ marginRight: '8px' }} />
          학습 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Brain size={40} color="#3b82f6" />
          TaskGenius 학습 시스템
        </h1>
        <p style={styles.subtitle}>
          AI가 사용자와의 대화를 통해 어떻게 학습하고 성장하는지 확인해보세요
        </p>
        
        <div style={styles.tabs}>
          <button 
            style={styles.tab(activeTab === 'overview')}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            전체 현황
          </button>
          <button 
            style={styles.tab(activeTab === 'user')}
            onClick={() => setActiveTab('user')}
          >
            <Users size={16} />
            개인 프로필
          </button>
          {/* 🆕 프로필 설정 탭 추가 */}
          <button 
            style={styles.tab(activeTab === 'profile')}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            프로필 설정
          </button>
          <button 
            style={styles.refreshButton}
            onClick={loadLearningData}
          >
            새로고침
          </button>
          <Link 
            href="/"
            style={styles.homeButton}
          >
            <Home size={16} />
            홈으로
          </Link>
        </div>
      </div>

      {/* 기존 overview 탭 */}
      {activeTab === 'overview' && stats && (
        <div style={styles.grid}>
          {/* 전체 상호작용 수 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <MessageSquare size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>총 상호작용</h3>
            </div>
            <div style={styles.metric}>{stats?.totalInteractions || 0}</div>
            <div style={styles.metricLabel}>AI와의 총 대화 수</div>
          </div>

          {/* 만족도 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <TrendingUp size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>사용자 만족도</h3>
            </div>
            <div style={styles.metric}>{stats?.positiveRate || 0}%</div>
            <div style={styles.metricLabel}>긍정적 피드백 비율</div>
            <div style={styles.progressBar()}>
              <div style={styles.progressFill(stats?.positiveRate || 0)}></div>
            </div>
          </div>

          {/* 평균 점수 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <Target size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>평균 점수</h3>
            </div>
            <div style={styles.metric}>{stats?.averageScore || 0}/100</div>
            <div style={styles.metricLabel}>조언 품질 점수</div>
            <div style={styles.progressBar()}>
              <div style={styles.progressFill(stats?.averageScore || 0)}></div>
            </div>
          </div>

          {/* 페르소나별 성과 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <BarChart3 size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>페르소나별 성과</h3>
            </div>
            <div style={styles.personaGrid}>
              {stats.personaStats && Object.entries(stats.personaStats).map(([persona, data]) => (
                <div key={persona} style={styles.personaCard}>
                  <div style={styles.personaName}>
                    {persona === 'branding' ? '🎨 브랜딩 전문가' : 
                     persona === 'content' ? '🎯 콘텐츠 전문가' : 
                     '🤖 통합 AI'}
                  </div>
                  <div style={styles.personaStats}>상호작용: {data.count}회</div>
                  <div style={styles.personaStats}>
                    평균 점수: {Math.round(data.averageScore * 100)}/100
                  </div>
                </div>
              ))}
              {(!stats.personaStats || Object.keys(stats.personaStats).length === 0) && (
                <div style={styles.personaCard}>
                  <div style={styles.personaName}>데이터 없음</div>
                  <div style={styles.personaStats}>아직 상호작용이 없습니다</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 기존 user 탭 */}
      {activeTab === 'user' && userProfile && (
        <div style={styles.grid}>
          {/* 개인 프로필 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <Users size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>개인 프로필</h3>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>선호 전문가:</strong> {
                userProfile.preferences?.preferredPersona === 'branding' ? '🎨 브랜딩 전문가' :
                userProfile.preferences?.preferredPersona === 'content' ? '🎯 콘텐츠 전문가' :
                '🤖 적응형'
              }
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>대화 스타일:</strong> {userProfile.preferences?.communicationStyle || '설정되지 않음'}
            </div>
            <div>
              <strong>총 상호작용:</strong> {userProfile.interactions?.length || 0}회
            </div>
          </div>

          {/* 만족도 추이 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon()}>
                <TrendingUp size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>만족도 추이</h3>
            </div>
            {userProfile.preferences?.satisfactionTrend?.length > 0 ? (
              <div style={styles.trendChart}>
                {userProfile.preferences.satisfactionTrend.slice(-10).map((trend, index) => (
                  <div 
                    key={index}
                    style={styles.trendBar(trend.score * 100)}
                    title={`점수: ${Math.round(trend.score * 100)}/100`}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.metricLabel}>아직 충분한 데이터가 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* 🆕 새로운 프로필 설정 탭 */}
      {activeTab === 'profile' && detailedProfile && (
        <div>
          {/* 프로필 헤더 */}
          <div style={styles.profileHeader}>
            <h2 style={styles.profileTitle}>프로필 관리</h2>
            <div style={styles.profileActions}>
              <button 
                style={styles.refreshButton}
                onClick={() => loadLearningData()}
                title="챗봇에서 수집한 최신 정보 반영"
              >
                🔄 새로고침
              </button>
              <span style={styles.lastUpdated}>
                마지막 업데이트: {new Date(detailedProfile.lastUpdated).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
          
          {/* 섹션 탭들 */}
          <div style={styles.profileSections}>
            <button 
              style={styles.sectionTab(profileSection === 'basic')}
              onClick={() => setProfileSection('basic')}
            >
              기본 정보
            </button>
            <button 
              style={styles.sectionTab(profileSection === 'business')}
              onClick={() => setProfileSection('business')}
            >
              사업 정보
            </button>
            <button 
              style={styles.sectionTab(profileSection === 'ai')}
              onClick={() => setProfileSection('ai')}
            >
              AI 선호도
            </button>
            <button 
              style={styles.sectionTab(profileSection === 'goals')}
              onClick={() => setProfileSection('goals')}
            >
              목표 설정
            </button>
            <button 
              style={styles.sectionTab(profileSection === 'brand')}
              onClick={() => setProfileSection('brand')}
            >
              브랜드 정보
            </button>
          </div>

          {/* 저장 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button 
              style={styles.saveButton}
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Settings size={16} className="animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save size={16} />
                  프로필 저장
                </>
              )}
            </button>
          </div>

          {/* 저장 상태 표시 */}
          {saveStatus !== 'idle' && (
            <div style={styles.statusIndicator(saveStatus)}>
              {saveStatus === 'success' ? (
                <>
                  <CheckCircle size={16} />
                  프로필이 성공적으로 저장되었습니다!
                </>
              ) : (
                <>
                  ❌ 프로필 저장에 실패했습니다. 다시 시도해주세요.
                </>
              )}
            </div>
          )}

          {/* 섹션 내용 */}
          <div style={styles.card}>
            {profileSection === 'basic' && (
              <div>
                <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>기본 정보</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>이름</label>
                  <input
                    style={styles.input}
                    value={detailedProfile.basicInfo?.name || ''}
                    onChange={(e) => updateProfile('basicInfo', 'name', e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>역할/직책</label>
                  <input
                    style={styles.input}
                    value={detailedProfile.basicInfo?.role || ''}
                    onChange={(e) => updateProfile('basicInfo', 'role', e.target.value)}
                    placeholder="예: 마케팅 팀장, CEO, 사업자 등"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>경험 년수</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.basicInfo?.experienceYears || ''}
                    onChange={(e) => updateProfile('basicInfo', 'experienceYears', e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="신입">신입 (1년 미만)</option>
                    <option value="1-3년">1-3년</option>
                    <option value="3-5년">3-5년</option>
                    <option value="5-10년">5-10년</option>
                    <option value="10년 이상">10년 이상</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>회사 규모</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.basicInfo?.companySize || ''}
                    onChange={(e) => updateProfile('basicInfo', 'companySize', e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="1인 사업자">1인 사업자</option>
                    <option value="스타트업">스타트업 (10명 미만)</option>
                    <option value="중소기업">중소기업 (10-100명)</option>
                    <option value="중견기업">중견기업 (100-500명)</option>
                    <option value="대기업">대기업 (500명 이상)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>업종</label>
                  <input
                    style={styles.input}
                    value={detailedProfile.basicInfo?.industry || ''}
                    onChange={(e) => updateProfile('basicInfo', 'industry', e.target.value)}
                    placeholder="예: IT, 패션, F&B, 뷰티, 교육 등"
                  />
                </div>
              </div>
            )}

            {profileSection === 'business' && (
              <div>
                <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>사업 정보</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>사업 유형</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.businessInfo?.businessType || ''}
                    onChange={(e) => updateProfile('businessInfo', 'businessType', e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="B2C">B2C (개인 고객 대상)</option>
                    <option value="B2B">B2B (기업 고객 대상)</option>
                    <option value="B2B2C">B2B2C (혼합)</option>
                    <option value="서비스업">서비스업</option>
                    <option value="제조업">제조업</option>
                    <option value="유통업">유통업</option>
                    <option value="컨설팅">컨설팅</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>주요 타겟 고객</label>
                  <textarea
                    style={styles.textarea}
                    value={detailedProfile.businessInfo?.targetCustomer || ''}
                    onChange={(e) => updateProfile('businessInfo', 'targetCustomer', e.target.value)}
                    placeholder="예: 20-30대 직장인 여성, 중소기업 마케팅 담당자 등"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>주요 제품/서비스</label>
                  <textarea
                    style={styles.textarea}
                    value={detailedProfile.businessInfo?.mainProducts || ''}
                    onChange={(e) => updateProfile('businessInfo', 'mainProducts', e.target.value)}
                    placeholder="주요 제품이나 서비스를 설명해주세요"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>경쟁 우위/차별화 포인트</label>
                  <textarea
                    style={styles.textarea}
                    value={detailedProfile.businessInfo?.competitiveAdvantage || ''}
                    onChange={(e) => updateProfile('businessInfo', 'competitiveAdvantage', e.target.value)}
                    placeholder="다른 경쟁사와 구별되는 강점이나 차별화 요소"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>시장 포지션</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.businessInfo?.marketPosition || ''}
                    onChange={(e) => updateProfile('businessInfo', 'marketPosition', e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="시장 리더">시장 리더</option>
                    <option value="강력한 경쟁자">강력한 경쟁자</option>
                    <option value="틈새 시장">틈새 시장</option>
                    <option value="신규 진입자">신규 진입자</option>
                    <option value="혁신적 도전자">혁신적 도전자</option>
                  </select>
                </div>
              </div>
            )}

            {profileSection === 'ai' && (
              <div>
                <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>AI 선호도 설정</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>선호하는 AI 페르소나</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.aiPreferences.preferredPersona}
                    onChange={(e) => updateProfile('aiPreferences', 'preferredPersona', e.target.value)}
                  >
                    <option value="adaptive">🤖 적응형 (상황에 맞게 자동 선택)</option>
                    <option value="branding">🎨 브랜딩 전문가</option>
                    <option value="content">📝 콘텐츠 전문가</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>커뮤니케이션 스타일</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.aiPreferences.communicationStyle}
                    onChange={(e) => updateProfile('aiPreferences', 'communicationStyle', e.target.value)}
                  >
                    <option value="balanced">균형잡힌</option>
                    <option value="concise">간결한</option>
                    <option value="detailed">상세한</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>응답 길이</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.aiPreferences.responseLength}
                    onChange={(e) => updateProfile('aiPreferences', 'responseLength', e.target.value)}
                  >
                    <option value="short">짧게</option>
                    <option value="medium">보통</option>
                    <option value="long">길게</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>격식 수준</label>
                  <select
                    style={styles.select}
                    value={detailedProfile.aiPreferences.formalityLevel}
                    onChange={(e) => updateProfile('aiPreferences', 'formalityLevel', e.target.value)}
                  >
                    <option value="casual">친근한</option>
                    <option value="professional">전문적인</option>
                    <option value="formal">격식있는</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>추가 옵션</label>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={detailedProfile.aiPreferences.includeExamples}
                        onChange={(e) => updateProfile('aiPreferences', 'includeExamples', e.target.checked)}
                      />
                      구체적인 예시 포함
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={detailedProfile.aiPreferences.includeActionItems}
                        onChange={(e) => updateProfile('aiPreferences', 'includeActionItems', e.target.checked)}
                      />
                      실행 가능한 액션 아이템 포함
                    </label>
                  </div>
                </div>
              </div>
            )}

            {profileSection === 'goals' && (
              <div>
                <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>목표 및 우선순위</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>주요 관심 분야</label>
                  <div style={styles.checkboxGroup}>
                    {['브랜딩', '콘텐츠 마케팅', '성장 전략', '고객 확보', 'SNS 운영', '바이럴 마케팅'].map(interest => (
                      <label key={interest} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={detailedProfile.goals.primaryInterests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateProfile('goals', 'primaryInterests', [...detailedProfile.goals.primaryInterests, interest]);
                            } else {
                              updateProfile('goals', 'primaryInterests', detailedProfile.goals.primaryInterests.filter(i => i !== interest));
                            }
                          }}
                        />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>단기 목표 (3개월 내)</label>
                  <div style={styles.tagList}>
                    {detailedProfile.goals.shortTermGoals.map((goal, index) => (
                      <div key={index} style={styles.tag}>
                        {goal}
                        <span 
                          style={styles.removeTag}
                          onClick={() => removeArrayItem('goals', 'shortTermGoals', index)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.addInput}>
                    <input
                      style={{...styles.input, flex: 1}}
                      placeholder="단기 목표를 입력하고 Enter를 누르세요"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('goals', 'shortTermGoals', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>장기 목표 (1년 내)</label>
                  <div style={styles.tagList}>
                    {detailedProfile.goals.longTermGoals.map((goal, index) => (
                      <div key={index} style={styles.tag}>
                        {goal}
                        <span 
                          style={styles.removeTag}
                          onClick={() => removeArrayItem('goals', 'longTermGoals', index)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.addInput}>
                    <input
                      style={{...styles.input, flex: 1}}
                      placeholder="장기 목표를 입력하고 Enter를 누르세요"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('goals', 'longTermGoals', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {profileSection === 'brand' && (
              <div>
                <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>브랜드 정보</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>브랜드 성격</label>
                  <div style={styles.checkboxGroup}>
                    {['친근한', '전문적인', '혁신적인', '신뢰할 수 있는', '창의적인', '럭셔리한', '실용적인', '재미있는'].map(personality => (
                      <label key={personality} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={detailedProfile.brandInfo.brandPersonality.includes(personality)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateProfile('brandInfo', 'brandPersonality', [...detailedProfile.brandInfo.brandPersonality, personality]);
                            } else {
                              updateProfile('brandInfo', 'brandPersonality', detailedProfile.brandInfo.brandPersonality.filter(p => p !== personality));
                            }
                          }}
                        />
                        {personality}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>브랜드 톤앤매너</label>
                  <textarea
                    style={styles.textarea}
                    value={detailedProfile.brandInfo.brandVoice}
                    onChange={(e) => updateProfile('brandInfo', 'brandVoice', e.target.value)}
                    placeholder="브랜드가 고객과 소통하는 방식, 톤, 언어 스타일을 설명해주세요"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>타겟 오디언스</label>
                  <textarea
                    style={styles.textarea}
                    value={detailedProfile.brandInfo.targetAudience}
                    onChange={(e) => updateProfile('brandInfo', 'targetAudience', e.target.value)}
                    placeholder="브랜드의 주요 타겟 고객층을 상세히 설명해주세요"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>브랜드 핵심 가치</label>
                  <div style={styles.tagList}>
                    {detailedProfile.brandInfo.brandValues.map((value, index) => (
                      <div key={index} style={styles.tag}>
                        {value}
                        <span 
                          style={styles.removeTag}
                          onClick={() => removeArrayItem('brandInfo', 'brandValues', index)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.addInput}>
                    <input
                      style={{...styles.input, flex: 1}}
                      placeholder="브랜드 가치를 입력하고 Enter를 누르세요"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('brandInfo', 'brandValues', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>브랜드 차별화 요소</label>
                  <div style={styles.tagList}>
                    {detailedProfile.brandInfo.brandDifferentiators.map((diff, index) => (
                      <div key={index} style={styles.tag}>
                        {diff}
                        <span 
                          style={styles.removeTag}
                          onClick={() => removeArrayItem('brandInfo', 'brandDifferentiators', index)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.addInput}>
                    <input
                      style={{...styles.input, flex: 1}}
                      placeholder="차별화 요소를 입력하고 Enter를 누르세요"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('brandInfo', 'brandDifferentiators', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!stats && !loading && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Brain size={48} color="#6b7280" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>학습 데이터가 없습니다</h3>
            <p style={{ color: '#6b7280' }}>
              AI와 대화하고 피드백을 남겨주시면 학습 진행 상황을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningDashboard;