'use client';

import React, { useState, useEffect } from 'react';
import { User, ArrowRightLeft, Brain, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-system';

export interface PersonaSwitchDecision {
  shouldSwitch: boolean;
  recommendedPersona: 'moment.ryan' | 'atozit';
  confidence: number;
  reason: string;
  triggerKeywords: string[];
}

interface PersonaSwitcherProps {
  currentPersona: 'moment.ryan' | 'atozit';
  onPersonaChange: (persona: 'moment.ryan' | 'atozit') => void;
  userMessage?: string;
  autoSwitch?: boolean;
  showConfidenceScore?: boolean;
}

const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  currentPersona,
  onPersonaChange,
  userMessage,
  autoSwitch = true,
  showConfidenceScore = true
}) => {
  const { data: session } = useSession();
  const [switchDecision, setSwitchDecision] = useState<PersonaSwitchDecision | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  const [lastAnalyzedMessage, setLastAnalyzedMessage] = useState<string>('');

  // 사용자 메시지가 변경될 때마다 페르소나 스위칭 분석
  useEffect(() => {
    if (userMessage && userMessage !== lastAnalyzedMessage && userMessage.length > 10) {
      analyzePersonaSwitch(userMessage);
      setLastAnalyzedMessage(userMessage);
    }
  }, [userMessage, lastAnalyzedMessage]);

  // 페르소나 스위칭 분석
  const analyzePersonaSwitch = async (message: string) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/persona-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'determine_persona_switch',
          userMessage: message,
          currentPersona: currentPersona
        })
      });

      const result = await response.json();
      
      if (result.success && result.decision) {
        setSwitchDecision(result.decision);
        
        // 자동 스위칭이 활성화되고 신뢰도가 높으면 스위치 프롬프트 표시
        if (autoSwitch && result.decision.shouldSwitch && result.decision.confidence > 0.7) {
          setShowSwitchPrompt(true);
        }
      }
    } catch (error) {
      console.error('페르소나 스위칭 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 페르소나 스위치 수락
  const acceptSwitch = () => {
    if (switchDecision) {
      onPersonaChange(switchDecision.recommendedPersona);
      logPersonaSwitch(switchDecision, 'accepted');
      setShowSwitchPrompt(false);
    }
  };

  // 페르소나 스위치 거부
  const rejectSwitch = () => {
    if (switchDecision) {
      logPersonaSwitch(switchDecision, 'rejected');
    }
    setShowSwitchPrompt(false);
  };

  // 수동 페르소나 변경
  const handleManualSwitch = (persona: 'moment.ryan' | 'atozit') => {
    onPersonaChange(persona);
    logPersonaSwitch({
      shouldSwitch: true,
      recommendedPersona: persona,
      confidence: 1.0,
      reason: '사용자 수동 선택',
      triggerKeywords: []
    }, 'manual');
    setShowSwitchPrompt(false);
  };

  // 페르소나 스위치 로그 기록
  const logPersonaSwitch = async (decision: PersonaSwitchDecision, action: 'accepted' | 'rejected' | 'manual') => {
    try {
      await fetch('/api/persona-switch-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousPersona: currentPersona,
          newPersona: decision.recommendedPersona,
          switchReason: decision.reason,
          triggerKeywords: decision.triggerKeywords,
          confidence: decision.confidence,
          userMessage: userMessage,
          action: action
        })
      });
    } catch (error) {
      console.error('페르소나 스위치 로그 기록 실패:', error);
    }
  };

  const getPersonaInfo = (persona: 'moment.ryan' | 'atozit') => {
    switch (persona) {
      case 'moment.ryan':
        return {
          name: 'Moment Ryan',
          icon: '🎯',
          color: colors.accent.blue,
          description: '마케팅·콘텐츠·SNS 전문',
          areas: ['디지털 마케팅', 'SNS 전략', '콘텐츠 기획']
        };
      case 'atozit':
        return {
          name: 'AtoZ IT',
          icon: '🏢',
          color: colors.accent.purple,
          description: '브랜딩·고객·경영 전문',
          areas: ['브랜딩', '고객 경험', '경영 전략']
        };
    }
  };

  const currentPersonaInfo = getPersonaInfo(currentPersona);
  const recommendedPersonaInfo = switchDecision ? getPersonaInfo(switchDecision.recommendedPersona) : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* 현재 페르소나 표시 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: spacing[3],
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
        border: `2px solid ${currentPersonaInfo.color}`,
        marginBottom: spacing[3]
      }}>
        <div style={{
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: currentPersonaInfo.color + '20',
          borderRadius: '50%'
        }}>
          {currentPersonaInfo.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <Typography variant="body" style={{ fontWeight: 'bold', color: currentPersonaInfo.color }}>
            {currentPersonaInfo.name}
          </Typography>
          <Typography variant="caption" color={colors.primary.gray[600]}>
            {currentPersonaInfo.description}
          </Typography>
        </div>

        {isAnalyzing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            color: colors.primary.gray[500]
          }}>
            <Brain size={16} className="animate-pulse" />
            <Typography variant="caption">분석 중...</Typography>
          </div>
        )}

        {showConfidenceScore && switchDecision && (
          <div style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: switchDecision.confidence > 0.7 
              ? colors.semantic.success + '20' 
              : colors.semantic.warning + '20',
            borderRadius: borderRadius.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1]
          }}>
            <Typography variant="caption" style={{ fontWeight: 'bold' }}>
              {Math.round(switchDecision.confidence * 100)}%
            </Typography>
          </div>
        )}
      </div>

      {/* 자동 스위치 프롬프트 */}
      {showSwitchPrompt && switchDecision && recommendedPersonaInfo && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.primary.gray[200]}`,
          borderRadius: borderRadius.md,
          padding: spacing[4],
          boxShadow: shadows.lg,
          marginTop: spacing[2]
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
            <ArrowRightLeft size={20} color={colors.semantic.info} />
            <Typography variant="body" style={{ fontWeight: 'bold' }}>
              페르소나 변경 제안
            </Typography>
            <div style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: colors.semantic.info + '20',
              borderRadius: borderRadius.sm
            }}>
              <Typography variant="caption" style={{ 
                color: colors.semantic.info,
                fontWeight: 'bold'
              }}>
                신뢰도 {Math.round(switchDecision.confidence * 100)}%
              </Typography>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[4],
            marginBottom: spacing[3]
          }}>
            {/* 현재 페르소나 */}
            <div style={{
              flex: 1,
              textAlign: 'center',
              opacity: 0.6
            }}>
              <div style={{ fontSize: '32px', marginBottom: spacing[1] }}>
                {currentPersonaInfo.icon}
              </div>
              <Typography variant="caption" color={colors.primary.gray[500]}>
                {currentPersonaInfo.name}
              </Typography>
            </div>

            <ArrowRightLeft size={24} color={colors.primary.gray[400]} />

            {/* 추천 페르소나 */}
            <div style={{
              flex: 1,
              textAlign: 'center',
              padding: spacing[2],
              backgroundColor: recommendedPersonaInfo.color + '10',
              borderRadius: borderRadius.md,
              border: `2px solid ${recommendedPersonaInfo.color}30`
            }}>
              <div style={{ fontSize: '32px', marginBottom: spacing[1] }}>
                {recommendedPersonaInfo.icon}
              </div>
              <Typography variant="body" style={{ 
                fontWeight: 'bold',
                color: recommendedPersonaInfo.color
              }}>
                {recommendedPersonaInfo.name}
              </Typography>
              <Typography variant="caption" color={colors.primary.gray[600]}>
                {recommendedPersonaInfo.description}
              </Typography>
            </div>
          </div>

          <div style={{
            padding: spacing[3],
            backgroundColor: colors.background.tertiary,
            borderRadius: borderRadius.md,
            marginBottom: spacing[3]
          }}>
            <Typography variant="caption" color={colors.primary.gray[700]}>
              <strong>전환 이유:</strong> {switchDecision.reason}
            </Typography>
            {switchDecision.triggerKeywords.length > 0 && (
              <div style={{ marginTop: spacing[2] }}>
                <Typography variant="caption" color={colors.primary.gray[600]}>
                  <strong>키워드:</strong>
                </Typography>
                <div style={{ display: 'flex', gap: spacing[1], marginTop: spacing[1] }}>
                  {switchDecision.triggerKeywords.map((keyword, index) => (
                    <span key={index} style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      backgroundColor: recommendedPersonaInfo.color + '20',
                      color: recommendedPersonaInfo.color,
                      borderRadius: borderRadius.sm,
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: spacing[2] }}>
            <Button
              variant="primary"
              onClick={acceptSwitch}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2]
              }}
            >
              <CheckCircle size={16} />
              변경하기
            </Button>
            <Button
              variant="secondary"
              onClick={rejectSwitch}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2]
              }}
            >
              <AlertCircle size={16} />
              유지하기
            </Button>
          </div>
        </div>
      )}

      {/* 수동 페르소나 선택 */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        marginTop: spacing[3]
      }}>
        <Button
          variant={currentPersona === 'moment.ryan' ? 'primary' : 'secondary'}
          onClick={() => handleManualSwitch('moment.ryan')}
          disabled={currentPersona === 'moment.ryan'}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2]
          }}
        >
          <span style={{ fontSize: '18px' }}>🎯</span>
          Moment Ryan
        </Button>
        <Button
          variant={currentPersona === 'atozit' ? 'primary' : 'secondary'}
          onClick={() => handleManualSwitch('atozit')}
          disabled={currentPersona === 'atozit'}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2]
          }}
        >
          <span style={{ fontSize: '18px' }}>🏢</span>
          AtoZ IT
        </Button>
      </div>

      {/* 페르소나 정보 표시 */}
      <div style={{
        marginTop: spacing[3],
        padding: spacing[3],
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.primary.gray[200]}`
      }}>
        <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[2], display: 'block' }}>
          <strong>{currentPersonaInfo.name} 전문 분야:</strong>
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
          {currentPersonaInfo.areas.map((area, index) => (
            <span key={index} style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: currentPersonaInfo.color + '15',
              color: currentPersonaInfo.color,
              borderRadius: borderRadius.sm,
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaSwitcher;