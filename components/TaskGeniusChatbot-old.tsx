'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

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

  const personas: Persona[] = [
    {
      id: 'general',
      name: '통합 AI',
      icon: '🤖',
      color: '#6366F1',
      description: '브랜딩과 콘텐츠 전 영역을 아우르는 종합 전략가',
      expertise: ['종합 전략', '문제 해결', '기획']
    },
    {
      id: 'branding',
      name: 'atozit',
      icon: '🎨',
      color: '#EC4899',
      description: 'Threads의 브랜드 전략가 • 고객 경험 설계 전문가',
      expertise: ['브랜드 포지셔닝', '고객 경험', '브랜드 전략']
    },
    {
      id: 'content',
      name: 'moment.ryan',
      icon: '🎯',
      color: '#10B981',
      description: 'Threads 4.1만 • Instagram 16.5만 • 멀티 플랫폼 크리에이터',
      expertise: ['Threads 전략', 'Instagram 릴스', '콘텐츠 기획']
    }
  ];

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
        // 실패 시 임시 ID 사용
        setConversationId('temp-' + Date.now());
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      // 실패 시 임시 ID 사용
      setConversationId('temp-' + Date.now());
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
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'AI',
          content: data.response,
          timestamp: new Date(),
          persona: currentPersona,
          suggestions: data.suggestions || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.text();
        console.error('Chat API error:', response.status, errorData);
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

  // 스타일 정의
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      maxHeight: '800px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    personaSelector: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px'
    },
    personaButton: (isActive: boolean, color: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: `2px solid ${isActive ? color : '#e2e8f0'}`,
      background: isActive ? `${color}15` : '#ffffff',
      color: isActive ? color : '#64748b',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: isActive 
        ? `0 4px 12px ${color}25, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
        : '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }),
    messagesArea: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto' as const,
      background: 'transparent'
    },
    messageWrapper: (isUser: boolean) => ({
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }),
    message: (isUser: boolean) => ({
      maxWidth: '70%',
      padding: '12px 16px',
      borderRadius: '16px',
      background: isUser 
        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        : '#ffffff',
      color: isUser ? '#ffffff' : '#1e293b',
      boxShadow: isUser
        ? '0 4px 12px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      lineHeight: '1.4'
    }),
    feedbackButtons: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px',
      justifyContent: 'flex-start'
    },
    feedbackButton: (isSelected: boolean) => ({
      padding: '4px 8px',
      borderRadius: '6px',
      border: 'none',
      background: isSelected ? '#22c55e' : '#f1f5f9',
      color: isSelected ? '#ffffff' : '#64748b',
      cursor: 'pointer',
      fontSize: '11px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
    }),
    inputArea: {
      padding: '16px 20px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderTop: '1px solid #e2e8f0',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    },
    inputWrapper: {
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-end'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      background: '#ffffff',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      resize: 'none' as const
    },
    actionButton: (isActive: boolean = false) => ({
      padding: '12px',
      borderRadius: '12px',
      border: 'none',
      background: isActive ? '#ef4444' : currentPersonaInfo.color,
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: `0 4px 12px ${currentPersonaInfo.color}25, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px',
      maxWidth: '200px'
    }
  };

  if (!session) {
    return (
      <div style={styles.container}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px' }}>🔒</div>
          <h3 style={{ color: '#64748b', margin: 0 }}>로그인이 필요합니다</h3>
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>
            TaskGenius 챗봇을 사용하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>{currentPersonaInfo.icon}</div>
          <div>
            <h3 style={{ margin: 0, color: '#1e293b' }}>
              {currentPersonaInfo.name}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {currentPersonaInfo.description}
            </p>
          </div>
        </div>
        
        {/* 페르소나 선택 */}
        <div style={styles.personaSelector}>
          {personas.map(persona => (
            <button
              key={persona.id}
              style={styles.personaButton(currentPersona === persona.id, persona.color)}
              onClick={() => switchPersona(persona.id)}
            >
              <span>{persona.icon}</span>
              <span>{persona.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div style={styles.messagesArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {currentPersonaInfo.icon}
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>
              안녕하세요, {session.user?.name}님!
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              {currentPersonaInfo.name}과 함께 비즈니스를 성장시켜보세요.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {currentPersonaInfo.expertise.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    padding: '4px 12px',
                    background: `${currentPersonaInfo.color}15`,
                    color: currentPersonaInfo.color,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} style={styles.messageWrapper(message.type === 'USER')}>
            <div>
              <div style={styles.message(message.type === 'USER')}>
                {message.content}
              </div>
              
              {/* AI 메시지에 피드백 버튼 추가 */}
              {message.type === 'AI' && (
                <div style={styles.feedbackButtons}>
                  <button
                    style={styles.feedbackButton(message.feedback === 'VERY_HELPFUL')}
                    onClick={() => handleFeedback(message.id, 'VERY_HELPFUL')}
                    title="매우 도움됨"
                  >
                    <Star size={12} />
                  </button>
                  <button
                    style={styles.feedbackButton(message.feedback === 'HELPFUL')}
                    onClick={() => handleFeedback(message.id, 'HELPFUL')}
                    title="도움됨"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    style={styles.feedbackButton(message.feedback === 'NOT_HELPFUL')}
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
          <div style={styles.messageWrapper(false)}>
            <div style={styles.typingIndicator}>
              <Bot size={16} color={currentPersonaInfo.color} />
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: currentPersonaInfo.color, animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: currentPersonaInfo.color, animation: 'pulse 1.5s ease-in-out infinite 0.5s' }}></div>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: currentPersonaInfo.color, animation: 'pulse 1.5s ease-in-out infinite 1s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`${currentPersonaInfo.name}에게 메시지를 보내세요...`}
            style={styles.input}
            disabled={isTyping}
          />
          
          <button
            style={styles.actionButton(isRecording)}
            onClick={() => setIsRecording(!isRecording)}
            title="음성 입력"
          >
            <Mic size={16} />
          </button>
          
          <button
            style={styles.actionButton()}
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            title="메시지 전송"
          >
            <Send size={16} />
          </button>
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