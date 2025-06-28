'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { colors, spacing, borderRadius, shadows, typography, animations } from '@/lib/design-system';

interface Message {
  id: string;
  type: 'USER' | 'AI';
  content: string;
  timestamp: Date;
  persona?: string;
  suggestions?: string[];
  feedback?: 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL';
}

interface Persona {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  expertise: string[];
}

const TaskGeniusChatbot: React.FC = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentPersona, setCurrentPersona] = useState<string>('general');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // PersonaService에서 페르소나 데이터 로드
  const [personas, setPersonas] = useState<Persona[]>([
    // 기본 페르소나 (PersonaService 로드 전 fallback)
    {
      id: 'general',
      name: '통합 AI',
      icon: '🤖',
      color: colors.primary.gray[700],
      description: '브랜딩과 콘텐츠 전 영역을 아우르는 종합 전략가',
      expertise: ['종합 전략', '문제 해결', '기획']
    }
  ]);

  // 페르소나 데이터 로드
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const response = await fetch('/api/personas?action=list');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.personas) {
            // PersonaDefinition을 Persona 형식으로 변환
            const convertedPersonas: Persona[] = data.personas.map((p: any) => ({
              id: p.identifier,
              name: p.name,
              icon: p.icon,
              color: p.color,
              description: p.description,
              expertise: p.expertise
            }));
            setPersonas(convertedPersonas);
            console.log('✅ 페르소나 데이터 로드 완료:', convertedPersonas.length);
          }
        }
      } catch (error) {
        console.warn('⚠️ 페르소나 데이터 로드 실패, 기본값 사용:', error);
        // 기본값 유지
      }
    };

    if (session) {
      loadPersonas();
    }
  }, [session]);

  const currentPersonaInfo = personas.find(p => p.id === currentPersona) || personas[0];

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 세션이 있을 때 대화 초기화
  useEffect(() => {
    if (session && !conversationId) {
      console.log('Initializing conversation for user:', session.user?.email);
      initializeConversation();
    }
  }, [session, conversationId]);

  // 대화 세션 초기화
  const initializeConversation = async () => {
    try {
      console.log('Creating new conversation...');
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${new Date().toLocaleDateString()} 대화`,
          persona: currentPersona
        })
      });

      console.log('Conversation API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Conversation created:', data);
        setConversationId(data.conversationId);
        
        // 기존 메시지가 있다면 불러오기
        if (data.conversation && data.conversation.messages && data.conversation.messages.length > 0) {
          loadMessages(data.conversationId);
        }
      } else {
        const errorData = await response.text();
        console.error('Conversation creation failed:', response.status, errorData);
        // 실패 시 사용자 기반 임시 ID 사용
        const userId = session?.user?.id || 'anonymous';
        setConversationId(`${userId}-${Date.now()}`);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      // 실패 시 사용자 기반 임시 ID 사용
      const userId = session?.user?.id || 'anonymous';
      setConversationId(`${userId}-${Date.now()}`);
    }
  };

  // 메시지 불러오기
  const loadMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            persona: msg.persona,
            suggestions: msg.suggestions ? msg.suggestions.split(',').filter(Boolean) : [],
            feedback: msg.feedbacks?.[0]?.feedback
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // 페르소나 전환
  const switchPersona = (personaId: string) => {
    console.log('🎭 페르소나 전환:', {
      from: currentPersona,
      to: personaId,
      personaData: personas.find(p => p.id === personaId)
    });
    
    setCurrentPersona(personaId);
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      const switchMessage: Message = {
        id: Date.now().toString(),
        type: 'AI',
        content: `🔄 ${persona.name}으로 전환되었습니다. ${persona.description}`,
        timestamp: new Date(),
        persona: personaId
      };
      setMessages(prev => [...prev, switchMessage]);
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputText.trim() || !session) return;
    
    console.log('Send message - conversationId:', conversationId);
    
    // conversationId가 없으면 재시도
    if (!conversationId) {
      console.log('No conversationId, attempting to initialize...');
      await initializeConversation();
      if (!conversationId) {
        console.error('Failed to initialize conversation, cannot send message');
        return;
      }
    }

    const messageText = inputText;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'USER',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      console.log('Sending chat request with:', { message: messageText, persona: currentPersona, conversationId });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          persona: currentPersona,
          conversationId: conversationId
        })
      });
      
      console.log('Chat API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Chat API response data:', data);
        
        // 응답 데이터 검증
        if (!data || typeof data.response !== 'string') {
          console.error('Invalid response data:', data);
          throw new Error('Invalid response format');
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'AI',
          content: data.response || '응답을 생성할 수 없습니다.',
          timestamp: new Date(),
          persona: currentPersona,
          suggestions: data.suggestions || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.text();
        console.error('Chat API error:', response.status, errorData);
        throw new Error(`Chat API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'AI',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
        persona: currentPersona
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 피드백 처리
  const handleFeedback = async (messageId: string, feedbackType: 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL') => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback: feedbackType
        })
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: feedbackType }
          : msg
      ));
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  // 키보드 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '800px',
        background: colors.background.secondary,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.xl,
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: spacing[4]
        }}>
          <div style={{ fontSize: '48px' }}>🔒</div>
          <Typography variant="h4" color={colors.primary.gray[600]}>
            로그인이 필요합니다
          </Typography>
          <Typography variant="body" color={colors.primary.gray[500]} align="center">
            TaskGenius 챗봇을 사용하려면 먼저 로그인해주세요.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 76px)',
      background: colors.background.primary,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.xl,
      overflow: 'hidden',
      fontFamily: typography.fontFamily.primary,
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        background: colors.background.primary,
        padding: spacing[5],
        borderBottom: `1px solid ${colors.primary.gray[200]}`,
        boxShadow: shadows.sm
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
          <div style={{ fontSize: '24px' }}>{currentPersonaInfo.icon}</div>
          <div>
            <Typography variant="h5" style={{ margin: 0 }}>
              {currentPersonaInfo.name}
            </Typography>
            <Typography variant="caption" color={colors.primary.gray[600]} style={{ margin: 0 }}>
              {currentPersonaInfo.description}
            </Typography>
          </div>
        </div>
        
        {/* 페르소나 선택 */}
        <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
          {personas.map(persona => (
            <button
              key={persona.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: borderRadius.lg,
                border: `2px solid ${currentPersona === persona.id ? persona.color : colors.primary.gray[200]}`,
                background: currentPersona === persona.id ? `${persona.color}15` : colors.background.primary,
                color: currentPersona === persona.id ? persona.color : colors.primary.gray[600],
                cursor: 'pointer',
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                transition: animations.transition.base,
                boxShadow: currentPersona === persona.id ? shadows.md : shadows.sm,
              }}
              onClick={() => switchPersona(persona.id)}
            >
              <span>{persona.icon}</span>
              <span>{persona.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: spacing[5],
        overflowY: 'auto',
        background: colors.background.secondary
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: spacing[16] }}>
            <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>
              {currentPersonaInfo.icon}
            </div>
            <Typography variant="h4" style={{ marginBottom: spacing[2] }}>
              안녕하세요, {session?.user?.name || '사용자'}님!
            </Typography>
            <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[5] }}>
              {currentPersonaInfo.name}과 함께 비즈니스를 성장시켜보세요.
            </Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], justifyContent: 'center' }}>
              {currentPersonaInfo.expertise.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    background: `${currentPersonaInfo.color}15`,
                    color: currentPersonaInfo.color,
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    border: `1px solid ${currentPersonaInfo.color}30`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id} 
            style={{
              display: 'flex',
              justifyContent: message.type === 'USER' ? 'flex-end' : 'flex-start',
              marginBottom: spacing[4]
            }}
          >
            <div style={{ maxWidth: '70%' }}>
              <div style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                borderRadius: borderRadius.xl,
                background: message.type === 'USER' 
                  ? colors.primary.black
                  : colors.background.primary,
                color: message.type === 'USER' ? colors.primary.white : colors.primary.gray[800],
                boxShadow: shadows.md,
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.relaxed,
                border: message.type === 'AI' ? `1px solid ${colors.primary.gray[200]}` : 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {message.content}
              </div>
              
              {/* AI 메시지에 피드백 버튼 추가 */}
              {message.type === 'AI' && (
                <div style={{
                  display: 'flex',
                  gap: spacing[1],
                  marginTop: spacing[2],
                  justifyContent: 'flex-start'
                }}>
                  <button
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.md,
                      border: 'none',
                      background: message.feedback === 'VERY_HELPFUL' ? colors.accent.yellow : colors.background.tertiary,
                      color: message.feedback === 'VERY_HELPFUL' ? colors.primary.black : colors.primary.gray[600],
                      cursor: 'pointer',
                      fontSize: typography.fontSize.xs,
                      transition: animations.transition.base,
                      boxShadow: shadows.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                    onClick={() => handleFeedback(message.id, 'VERY_HELPFUL')}
                    title="매우 도움됨"
                  >
                    <Star size={12} />
                  </button>
                  <button
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.md,
                      border: 'none',
                      background: message.feedback === 'HELPFUL' ? colors.semantic.success : colors.background.tertiary,
                      color: message.feedback === 'HELPFUL' ? colors.primary.white : colors.primary.gray[600],
                      cursor: 'pointer',
                      fontSize: typography.fontSize.xs,
                      transition: animations.transition.base,
                      boxShadow: shadows.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                    onClick={() => handleFeedback(message.id, 'HELPFUL')}
                    title="도움됨"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.md,
                      border: 'none',
                      background: message.feedback === 'NOT_HELPFUL' ? colors.semantic.error : colors.background.tertiary,
                      color: message.feedback === 'NOT_HELPFUL' ? colors.primary.white : colors.primary.gray[600],
                      cursor: 'pointer',
                      fontSize: typography.fontSize.xs,
                      transition: animations.transition.base,
                      boxShadow: shadows.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                    onClick={() => handleFeedback(message.id, 'NOT_HELPFUL')}
                    title="아쉬움"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: spacing[4]
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[4]}`,
              background: colors.background.primary,
              borderRadius: borderRadius.xl,
              boxShadow: shadows.md,
              maxWidth: '200px',
              border: `1px solid ${colors.primary.gray[200]}`,
            }}>
              <Bot size={16} color={currentPersonaInfo.color} />
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ 
                  width: '4px', 
                  height: '4px', 
                  borderRadius: '50%', 
                  background: currentPersonaInfo.color, 
                  animation: 'pulse 1.5s ease-in-out infinite' 
                }} />
                <div style={{ 
                  width: '4px', 
                  height: '4px', 
                  borderRadius: '50%', 
                  background: currentPersonaInfo.color, 
                  animation: 'pulse 1.5s ease-in-out infinite 0.5s' 
                }} />
                <div style={{ 
                  width: '4px', 
                  height: '4px', 
                  borderRadius: '50%', 
                  background: currentPersonaInfo.color, 
                  animation: 'pulse 1.5s ease-in-out infinite 1s' 
                }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: `${spacing[4]} ${spacing[5]} ${spacing[4]} ${spacing[5]}`,
        background: colors.background.primary,
        borderTop: `1px solid ${colors.primary.gray[200]}`,
        boxShadow: shadows.sm,
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'flex-end' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`${currentPersonaInfo.name}에게 메시지를 보내세요...`}
            style={{
              flex: 1,
              padding: `${spacing[3]} ${spacing[4]}`,
              borderRadius: borderRadius.xl,
              border: `2px solid ${colors.primary.gray[200]}`,
              background: colors.background.primary,
              fontSize: typography.fontSize.sm,
              outline: 'none',
              transition: animations.transition.base,
              fontFamily: typography.fontFamily.primary,
              boxShadow: shadows.sm,
            }}
            disabled={isTyping}
            onFocus={(e) => {
              e.target.style.borderColor = currentPersonaInfo.color;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.primary.gray[200];
            }}
          />
          
          <Button
            variant={isRecording ? 'accent' : 'secondary'}
            onClick={() => setIsRecording(!isRecording)}
            style={{ padding: spacing[3] }}
          >
            <Mic size={16} />
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            style={{ 
              padding: spacing[3],
              backgroundColor: currentPersonaInfo.color,
            }}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskGeniusChatbot;