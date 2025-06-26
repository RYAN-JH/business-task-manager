'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, MoreVertical, CheckSquare, Calendar, Users, Zap, Brain, Sparkles } from 'lucide-react';

const TaskGeniusChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '안녕하세요! TaskGenius AI입니다 🤖\n작업 관리, 프로젝트 계획, 팀 협업 등 무엇이든 도와드릴게요!',
      timestamp: new Date(),
      suggestions: ['새 프로젝트 시작하기', '오늘 할 일 정리', '팀 미팅 스케줄링', '작업 우선순위 설정']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const simulateAIResponse = (userMessage: string) => {
    const responses: { [key: string]: { content: string; suggestions: string[] } } = {
      '새 프로젝트 시작하기': {
        content: '새 프로젝트를 시작하시는군요! 🎯\n\n다음 단계로 도와드릴게요:\n\n1. **프로젝트 목표 설정**\n2. **팀원 배정 및 역할 분담**\n3. **마일스톤 및 데드라인 설정**\n4. **작업 분해 구조(WBS) 생성**\n\n어떤 종류의 프로젝트인지 알려주시면 더 구체적으로 도와드릴 수 있어요!',
        suggestions: ['웹 개발 프로젝트', '마케팅 캠페인', '제품 런칭', '팀 빌딩']
      },
      '오늘 할 일 정리': {
        content: '오늘의 작업을 효율적으로 정리해드릴게요! ✅\n\n**추천 우선순위 매트릭스:**\n• 🔥 긴급 + 중요\n• ⭐ 중요하지만 긴급하지 않음\n• ⚡ 긴급하지만 중요하지 않음\n• 📝 일반 업무\n\n현재 진행 중인 작업들을 알려주시면 우선순위를 함께 정해보죠!',
        suggestions: ['진행 중인 작업 보기', '새 작업 추가', '데드라인 체크', '팀원 작업 현황']
      },
      '팀 미팅 스케줄링': {
        content: '팀 미팅 일정을 잡아보시는군요! 📅\n\n**효율적인 미팅을 위한 체크리스트:**\n\n✓ 미팅 목적과 아젠다 명확화\n✓ 참석자 일정 조율\n✓ 적절한 시간 배정 (30분-1시간)\n✓ 사전 자료 공유\n✓ 액션 아이템 정리\n\n어떤 주제의 미팅인지 알려주시면 더 상세한 가이드를 제공해드릴게요!',
        suggestions: ['프로젝트 킥오프', '주간 스크럼', '분기 리뷰', '브레인스토밍']
      }
    };

    const defaultResponse = {
      content: `"${userMessage}"에 대해 답변드리겠습니다! 🤔\n\n더 구체적인 도움을 위해 다음 중 하나를 선택해주시거나, 상세한 질문을 해주세요:\n\n• 프로젝트 관리 전략\n• 작업 효율성 개선\n• 팀 커뮤니케이션\n• 시간 관리 팁\n\n어떤 부분에서 도움이 필요하신지 알려주세요!`,
      suggestions: ['프로젝트 계획 수립', '작업 자동화', '성과 측정', '리스크 관리']
    };

    return responses[userMessage] || defaultResponse;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = simulateAIResponse(inputText);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>TaskGenius AI</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>스마트 작업 관리 어시스턴트</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%'
                }}></div>
                <span>온라인</span>
              </div>
              <button style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <MoreVertical style={{ width: '20px', height: '20px', color: '#6b7280' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px 16px', paddingBottom: '150px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ maxWidth: '768px', width: '100%' }}>
                {message.type === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>TaskGenius AI</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  marginLeft: message.type === 'user' ? 'auto' : '0',
                  background: message.type === 'user' 
                    ? 'linear-gradient(45deg, #2563eb, #1d4ed8)' 
                    : 'white',
                  color: message.type === 'user' ? 'white' : '#111827',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: message.type === 'ai' ? '1px solid #e5e7eb' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.content}
                </div>

                {'suggestions' in message && message.suggestions && (
                  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '14px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.type === 'user' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ maxWidth: '768px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>TaskGenius AI</span>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.1s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.2s'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
                      AI가 응답을 준비하고 있습니다...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '16px' }}>
          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}>
              <CheckSquare style={{ width: '16px', height: '16px' }} />
              <span>작업 생성</span>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              <span>일정 관리</span>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#faf5ff',
              color: '#7c3aed',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span>팀 협업</span>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}>
              <Zap style={{ width: '16px', height: '16px' }} />
              <span>자동화</span>
            </button>
          </div>

          {/* Input Box */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <button style={{
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <Paperclip style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            </button>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="TaskGenius AI에게 무엇이든 물어보세요... (Shift+Enter로 줄바꿈)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '48px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>

            <button
              onClick={toggleRecording}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isRecording ? '#ef4444' : 'transparent',
                color: isRecording ? 'white' : '#6b7280'
              }}
            >
              <Mic style={{ width: '20px', height: '20px' }} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              style={{
                padding: '12px',
                background: inputText.trim() 
                  ? 'linear-gradient(45deg, #2563eb, #1d4ed8)' 
                  : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Send style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            TaskGenius AI는 학습을 통해 지속적으로 개선됩니다. 정확한 정보를 위해 중요한 결정 전에는 검토해주세요.
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
      `}</style>
    </div>
  );
};

export default TaskGeniusChatbot;