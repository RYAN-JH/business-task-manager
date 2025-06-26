'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, MoreVertical, CheckSquare, Calendar, Users, Zap, Brain, Sparkles, Target, TrendingUp, Edit3, BarChart3, Lightbulb, Video } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  persona?: string;
  suggestions?: string[];
}

interface Persona {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const TaskGeniusChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '안녕하세요! TaskGenius AI입니다 🤖\n\n저는 두 가지 전문 영역의 AI 어시스턴트입니다:\n\n🎯 **브랜딩 전문가** - 브랜드 전략, 포지셔닝, 브랜드 아이덴티티\n📝 **콘텐츠 전문가** - 콘텐츠 기획, 바이럴 전략, 크리에이티브 제작\n\n어떤 전문가의 도움이 필요하신가요?',
      timestamp: new Date(),
      suggestions: ['브랜딩 전문가와 상담', '콘텐츠 전문가와 상담', '브랜드 진단받기', '바이럴 콘텐츠 기획']
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('general');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 페르소나 정의
  const personas: Record<string, Persona> = {
    general: {
      name: 'TaskGenius AI',
      icon: Brain,
      color: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      description: '통합 AI 어시스턴트'
    },
    branding: {
      name: '브랜딩 전문가',
      icon: Target,
      color: 'linear-gradient(135deg, #7c3aed, #ec4899)',
      description: '브랜드 전략 & 포지셔닝 전문'
    },
    content: {
      name: '콘텐츠 전문가',
      icon: Edit3,
      color: 'linear-gradient(135deg, #059669, #2563eb)',
      description: '콘텐츠 기획 & 바이럴 전략 전문'
    }
  };

  // 스타일 정의
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 10,
      padding: '16px'
    },
    headerContent: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    personaIcon: (color: string) => ({
      width: '40px',
      height: '40px',
      background: color,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    headerTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    onlineStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#dcfce7',
      color: '#166534',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    onlineDot: {
      width: '8px',
      height: '8px',
      background: '#22c55e',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    personaButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#f3f4f6',
      borderRadius: '8px',
      padding: '4px'
    },
    personaButton: (active: boolean, hovered: boolean) => ({
      padding: '8px',
      borderRadius: '6px',
      border: 'none',
      background: active ? '#7c3aed' : hovered ? '#e5e7eb' : 'transparent',
      color: active ? 'white' : '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    moreButton: {
      padding: '8px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'background-color 0.2s'
    },
    chatContainer: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '24px 16px',
      marginBottom: '160px' // 120px에서 160px로 변경
    },
    messagesContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'
    },
    messageWrapper: (isUser: boolean) => ({
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start'
    }),
    messageContent: {
      maxWidth: '75%',
      order: 1
    },
    aiMessageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    aiAvatar: (color: string) => ({
      width: '32px',
      height: '32px',
      background: color,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    aiName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    timestamp: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    messageBubble: (isUser: boolean) => ({
      padding: '16px',
      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
      background: isUser 
        ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
        : 'white',
      color: isUser ? 'white' : '#333',
      boxShadow: isUser 
        ? '0 8px 20px rgba(37, 99, 235, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginLeft: isUser ? 'auto' : '0'
    }),
    messageText: {
      whiteSpace: 'pre-wrap' as const,
      lineHeight: '1.5',
      fontSize: '15px'
    },
    suggestions: {
      marginTop: '12px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px'
    },
    suggestionButton: (hovered: boolean) => ({
      padding: '8px 12px',
      fontSize: '14px',
      background: hovered ? '#dbeafe' : '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: hovered ? 'translateY(-1px)' : 'none'
    }),
    userTimestamp: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '8px',
      fontSize: '12px',
      color: '#9ca3af'
    },
    typingContainer: {
      display: 'flex',
      justifyContent: 'flex-start'
    },
    typingContent: {
      maxWidth: '75%'
    },
    typingBubble: {
      background: 'white',
      padding: '16px',
      borderRadius: '20px 20px 20px 4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6'
    },
    typingDots: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    typingDot: (delay: number) => ({
      width: '8px',
      height: '8px',
      background: '#3b82f6',
      borderRadius: '50%',
      animation: `bounce 1.5s ease-in-out ${delay}s infinite`
    }),
    typingText: {
      fontSize: '14px',
      color: '#6b7280',
      marginLeft: '8px'
    },
    inputArea: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '16px'
    },
    inputContainer: {
      maxWidth: '1024px',
      margin: '0 auto'
    },
    quickActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      overflowX: 'auto' as const,
      paddingBottom: '8px'
    },
    quickActionButton: (active: boolean, color: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: active ? `1px solid ${color}` : `1px solid transparent`,
      background: active ? `${color}20` : `${color}10`,
      color: color
    }),
    inputBox: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px'
    },
    attachButton: {
      padding: '12px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'background-color 0.2s'
    },
    inputWrapper: {
      flex: 1,
      position: 'relative' as const
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      paddingRight: '48px',
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      resize: 'none' as const,
      outline: 'none',
      fontFamily: 'inherit',
      lineHeight: '1.5',
      fontSize: '15px',
      minHeight: '48px',
      maxHeight: '120px',
      transition: 'border-color 0.2s'
    },
    micButton: (recording: boolean) => ({
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      background: recording ? '#ef4444' : 'transparent',
      color: recording ? 'white' : '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
    sendButton: (disabled: boolean) => ({
      padding: '12px',
      background: disabled 
        ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
        : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    footer: {
      fontSize: '12px',
      color: '#9ca3af',
      textAlign: 'center' as const,
      marginTop: '8px'
    }
  };

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 50);
  });
};

useEffect(() => {
  scrollToBottom();
}, [messages, isTyping]);

  // Claude API 호출 함수
  const callClaudeAPI = async (userMessage: string, persona: string = currentPersona): Promise<void> => {
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          persona: persona,
          conversationHistory: messages.slice(-5)
        })
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        persona: data.persona || persona,
        suggestions: data.suggestions || getPersonaSuggestions(persona)
      }]);
    } catch (error) {
      console.error('Claude API 오류:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 🙏',
        timestamp: new Date(),
        persona: persona
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 페르소나별 추천 질문
  const getPersonaSuggestions = (persona: string): string[] => {
    const suggestions: Record<string, string[]> = {
      general: ['브랜딩 전문가와 상담', '콘텐츠 전문가와 상담', '전체 마케팅 전략', '비즈니스 성장 방안'],
      branding: ['브랜드 진단받기', '포지셔닝 전략 수립', '브랜드 아이덴티티 개선', '경쟁사 분석'],
      content: ['바이럴 콘텐츠 기획', 'SNS 콘텐츠 전략', '크리에이티브 아이디어', '콘텐츠 캘린더 작성']
    };
    return suggestions[persona] || suggestions.general;
  };

  // 페르소나 자동 감지 및 전환
  const detectPersona = (message: string): string => {
    const brandingKeywords = ['브랜드', '브랜딩', '포지셔닝', '아이덴티티', '차별화', '브랜드 진단', '브랜드 전략', '브랜드 가치'];
    const contentKeywords = ['콘텐츠', '바이럴', '크리에이티브', '영상', '포스팅', 'SNS', '인스타', '유튜브', '틱톡', '콘텐츠 기획'];
    
    const lowerMessage = message.toLowerCase();
    
    const brandingScore = brandingKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    const contentScore = contentKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (brandingScore > contentScore && brandingScore > 0) {
      return 'branding';
    } else if (contentScore > brandingScore && contentScore > 0) {
      return 'content';
    }
    
    return currentPersona === 'general' ? 'general' : currentPersona;
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setInputText(suggestion);
    inputRef.current?.focus();
    
    // 페르소나 자동 전환
    if (suggestion.includes('브랜딩') || suggestion.includes('브랜드')) {
      setCurrentPersona('branding');
    } else if (suggestion.includes('콘텐츠') || suggestion.includes('바이럴')) {
      setCurrentPersona('content');
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTimeout(scrollToBottom, 0);
    const messageToSend = inputText;
    setInputText('');

    // 페르소나 자동 감지
    const detectedPersona = detectPersona(messageToSend);
    setCurrentPersona(detectedPersona);

    // Claude API 호출
    callClaudeAPI(messageToSend, detectedPersona);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = (): void => {
    setIsRecording(!isRecording);
  };

  // 페르소나 수동 전환
  const switchPersona = (persona: string): void => {
    setCurrentPersona(persona);
    const switchMessages: Record<string, string> = {
      branding: '🎯 브랜딩 전문가 모드로 전환되었습니다. 브랜드 전략과 포지셔닝에 대해 상담해드릴게요!',
      content: '📝 콘텐츠 전문가 모드로 전환되었습니다. 바이럴 콘텐츠와 크리에이티브 기획을 도와드릴게요!',
      general: '🤖 통합 AI 모드로 전환되었습니다. 브랜딩과 콘텐츠 전 영역에서 도움을 드릴게요!'
    };

    const newMessage: Message = {
      id: Date.now(),
      type: 'ai',
      content: switchMessages[persona],
      timestamp: new Date(),
      persona: persona,
      suggestions: getPersonaSuggestions(persona)
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const getCurrentPersona = (): Persona => {
    return personas[currentPersona] || personas.general;
  };

  // 현재 페르소나 정보 및 아이콘 컴포넌트 준비
  const currentPersonaInfo = getCurrentPersona();
  const IconComponent = currentPersonaInfo.icon;

  return (
    <div style={styles.container}>
      {/* CSS 애니메이션 정의 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce {
          0%, 70%, 100% { 
            transform: translateY(0); 
            opacity: 0.4; 
          }
          35% { 
            transform: translateY(-10px); 
            opacity: 1; 
          }
        }
        
        @media (max-width: 768px) {
          .mobile-hidden { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.personaIcon(currentPersonaInfo.color)}>
              <IconComponent size={24} color="white" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>{currentPersonaInfo.name}</h1>
              <p style={styles.headerSubtitle}>{currentPersonaInfo.description}</p>
            </div>
          </div>
          
          {/* 페르소나 전환 버튼 */}
          <div style={styles.headerRight}>
            <div style={styles.onlineStatus}>
              <div style={styles.onlineDot}></div>
              <span>온라인</span>
            </div>
            
            <div style={styles.personaButtons}>
              <button
                style={styles.personaButton(currentPersona === 'branding', hoveredButton === 'branding')}
                onClick={() => switchPersona('branding')}
                onMouseEnter={() => setHoveredButton('branding')}
                onMouseLeave={() => setHoveredButton(null)}
                title="브랜딩 전문가"
              >
                <Target size={16} />
              </button>
              <button
                style={styles.personaButton(currentPersona === 'content', hoveredButton === 'content')}
                onClick={() => switchPersona('content')}
                onMouseEnter={() => setHoveredButton('content')}
                onMouseLeave={() => setHoveredButton(null)}
                title="콘텐츠 전문가"
              >
                <Edit3 size={16} />
              </button>
              <button
                style={styles.personaButton(currentPersona === 'general', hoveredButton === 'general')}
                onClick={() => switchPersona('general')}
                onMouseEnter={() => setHoveredButton('general')}
                onMouseLeave={() => setHoveredButton(null)}
                title="통합 AI"
              >
                <Brain size={16} />
              </button>
            </div>
            
            <button 
              style={styles.moreButton}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div key={message.id} style={styles.messageWrapper(message.type === 'user')}>
              <div style={styles.messageContent}>
                {message.type === 'ai' && (
                  <div style={styles.aiMessageHeader}>
                    <div style={styles.aiAvatar(
                      message.persona ? personas[message.persona]?.color || personas.general.color : personas.general.color
                    )}>
                      <Sparkles size={16} color="white" />
                    </div>
                    <span style={styles.aiName}>
                      {message.persona ? personas[message.persona]?.name || 'TaskGenius AI' : 'TaskGenius AI'}
                    </span>
                    <span style={styles.timestamp}>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                )}
                
                <div style={styles.messageBubble(message.type === 'user')}>
                  <div style={styles.messageText}>{message.content}</div>
                </div>

                {message.suggestions && (
                  <div style={styles.suggestions}>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        style={styles.suggestionButton(hoveredButton === `suggestion-${index}`)}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setHoveredButton(`suggestion-${index}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.type === 'user' && (
                  <div style={styles.userTimestamp}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={styles.typingContainer}>
              <div style={styles.typingContent}>
                <div style={styles.aiMessageHeader}>
                  <div style={styles.aiAvatar(currentPersonaInfo.color)}>
                    <Sparkles size={16} color="white" />
                  </div>
                  <span style={styles.aiName}>{currentPersonaInfo.name}</span>
                </div>
                <div style={styles.typingBubble}>
                  <div style={styles.typingDots}>
                    <div style={styles.typingDot(0)}></div>
                    <div style={styles.typingDot(0.1)}></div>
                    <div style={styles.typingDot(0.2)}></div>
                    <span style={styles.typingText}>{currentPersonaInfo.name}가 응답을 준비하고 있습니다...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} 
              style={{ 
                height: '20px', 
                width: '100%' 
              }} 
            />
        </div>
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <div style={styles.inputContainer}>
          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <button 
              style={styles.quickActionButton(currentPersona === 'branding', '#7c3aed')}
              onClick={() => switchPersona('branding')}
            >
              <Target size={16} />
              <span>브랜딩 전문가</span>
            </button>
            <button 
              style={styles.quickActionButton(currentPersona === 'content', '#059669')}
              onClick={() => switchPersona('content')}
            >
              <Edit3 size={16} />
              <span>콘텐츠 전문가</span>
            </button>
            <button style={styles.quickActionButton(false, '#2563eb')}>
              <Calendar size={16} />
              <span>일정 관리</span>
            </button>
            <button style={styles.quickActionButton(false, '#ea580c')}>
              <Zap size={16} />
              <span>자동화</span>
            </button>
          </div>

          {/* Input Box */}
          <div style={styles.inputBox}>
            <button 
              style={styles.attachButton}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <Paperclip size={20} />
            </button>
            
            <div style={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`${currentPersonaInfo.name}에게 무엇이든 물어보세요... (Shift+Enter로 줄바꿈)`}
                style={styles.textarea}
                rows={1}
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              style={styles.micButton(isRecording)}
              onClick={toggleRecording}
              onMouseEnter={(e) => {
                if (!isRecording) e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                if (!isRecording) e.target.style.background = 'transparent';
              }}
            >
              <Mic size={20} />
            </button>

            <button
              style={styles.sendButton(!inputText.trim())}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} />
            </button>
          </div>

          <div style={styles.footer}>
            TaskGenius AI는 브랜딩과 콘텐츠 분야의 전문 지식을 바탕으로 맞춤형 조언을 제공합니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskGeniusChatbot;