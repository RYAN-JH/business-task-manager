-- Admin 페르소나 학습 시스템을 위한 데이터베이스 스키마 업데이트

-- 대화 세션 테이블 (Admin과 AI의 대화 저장)
CREATE TABLE IF NOT EXISTS ConversationSession (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  adminEmail TEXT,
  personaType TEXT NOT NULL CHECK (personaType IN ('moment.ryan', 'atozit')),
  sessionStartTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sessionEndTime DATETIME,
  totalMessages INTEGER DEFAULT 0,
  sessionStatus TEXT DEFAULT 'active' CHECK (sessionStatus IN ('active', 'completed', 'summarized')),
  sessionTitle TEXT,
  sessionContext TEXT, -- JSON 형태로 세션 컨텍스트 저장
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

-- 대화 메시지 테이블 (개별 메시지 저장)
CREATE TABLE IF NOT EXISTS ConversationMessage (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sessionId TEXT NOT NULL,
  messageIndex INTEGER NOT NULL, -- 세션 내 메시지 순서
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  messageType TEXT DEFAULT 'chat' CHECK (messageType IN ('chat', 'proactive_question', 'expertise_extraction')),
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON 형태로 메시지 메타데이터 저장
  learningPriority INTEGER DEFAULT 5 CHECK (learningPriority BETWEEN 1 AND 10), -- 1=최고우선순위, 10=낮음
  extractedInsights TEXT, -- JSON 형태로 추출된 인사이트 저장
  
  FOREIGN KEY (sessionId) REFERENCES ConversationSession (id) ON DELETE CASCADE,
  UNIQUE(sessionId, messageIndex)
);

-- 세션 요약 테이블 (세션 종료 시 생성되는 요약)
CREATE TABLE IF NOT EXISTS SessionSummary (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sessionId TEXT NOT NULL UNIQUE,
  personaType TEXT NOT NULL,
  adminEmail TEXT NOT NULL,
  summaryContent TEXT NOT NULL, -- 대화 전체 요약
  extractedKnowledge TEXT NOT NULL, -- JSON 형태로 추출된 지식/전문성
  learningInsights TEXT NOT NULL, -- JSON 형태로 학습에 반영할 인사이트
  keyTopics TEXT, -- JSON 배열 형태로 주요 토픽들
  expertiseAreas TEXT, -- JSON 배열 형태로 전문 분야
  personalityTraits TEXT, -- JSON 형태로 성격/성향 특성
  writingStyleAnalysis TEXT, -- JSON 형태로 글쓰기 스타일 분석
  businessInsights TEXT, -- JSON 형태로 비즈니스 관련 인사이트
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  appliedToPersona BOOLEAN DEFAULT FALSE, -- 페르소나에 반영 여부
  appliedAt DATETIME, -- 페르소나 반영 시간
  
  FOREIGN KEY (sessionId) REFERENCES ConversationSession (id) ON DELETE CASCADE
);

-- 페르소나 학습 로그 테이블 (페르소나 업데이트 이력 추적)
CREATE TABLE IF NOT EXISTS PersonaLearningLog (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  personaType TEXT NOT NULL,
  sourceType TEXT NOT NULL CHECK (sourceType IN ('admin_conversation', 'maily_data', 'social_media', 'manual_update')),
  sourceId TEXT, -- SessionSummary.id 또는 다른 소스의 ID
  updateType TEXT NOT NULL CHECK (updateType IN ('writing_style', 'expertise', 'personality', 'business_knowledge', 'full_sync')),
  previousData TEXT, -- JSON 형태로 업데이트 이전 데이터
  newData TEXT, -- JSON 형태로 업데이트 후 데이터
  changeDescription TEXT,
  learningPriority INTEGER DEFAULT 5,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT -- Admin 이메일 또는 시스템
);

-- 페르소나 스위칭 로그 테이블 (자동 스위칭 이력 추적)
CREATE TABLE IF NOT EXISTS PersonaSwitchLog (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  previousPersona TEXT,
  newPersona TEXT NOT NULL,
  switchReason TEXT NOT NULL, -- 스위칭 사유 (키워드 매칭, 수동 선택 등)
  triggerKeywords TEXT, -- JSON 배열 형태로 트리거된 키워드들
  confidence REAL DEFAULT 0.0, -- 스위칭 결정의 신뢰도 (0.0 ~ 1.0)
  userMessage TEXT, -- 스위칭을 유발한 사용자 메시지
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

-- 능동적 질문 템플릿 테이블 (Admin 전용 질문 시스템)
CREATE TABLE IF NOT EXISTS ProactiveQuestionTemplate (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  personaType TEXT NOT NULL,
  category TEXT NOT NULL, -- 'expertise', 'personality', 'business', 'writing_style' 등
  questionText TEXT NOT NULL,
  followUpQuestions TEXT, -- JSON 배열 형태로 후속 질문들
  triggerConditions TEXT, -- JSON 형태로 질문 트리거 조건
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  isActive BOOLEAN DEFAULT TRUE,
  usageCount INTEGER DEFAULT 0, -- 사용된 횟수
  lastUsed DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_conversation_session_user ON ConversationSession(userId);
CREATE INDEX IF NOT EXISTS idx_conversation_session_persona ON ConversationSession(personaType);
CREATE INDEX IF NOT EXISTS idx_conversation_session_admin ON ConversationSession(adminEmail);
CREATE INDEX IF NOT EXISTS idx_conversation_session_status ON ConversationSession(sessionStatus);
CREATE INDEX IF NOT EXISTS idx_conversation_session_time ON ConversationSession(sessionStartTime);

CREATE INDEX IF NOT EXISTS idx_conversation_message_session ON ConversationMessage(sessionId);
CREATE INDEX IF NOT EXISTS idx_conversation_message_type ON ConversationMessage(messageType);
CREATE INDEX IF NOT EXISTS idx_conversation_message_priority ON ConversationMessage(learningPriority);
CREATE INDEX IF NOT EXISTS idx_conversation_message_time ON ConversationMessage(timestamp);

CREATE INDEX IF NOT EXISTS idx_session_summary_persona ON SessionSummary(personaType);
CREATE INDEX IF NOT EXISTS idx_session_summary_admin ON SessionSummary(adminEmail);
CREATE INDEX IF NOT EXISTS idx_session_summary_applied ON SessionSummary(appliedToPersona);

CREATE INDEX IF NOT EXISTS idx_persona_learning_log_persona ON PersonaLearningLog(personaType);
CREATE INDEX IF NOT EXISTS idx_persona_learning_log_source ON PersonaLearningLog(sourceType);
CREATE INDEX IF NOT EXISTS idx_persona_learning_log_type ON PersonaLearningLog(updateType);
CREATE INDEX IF NOT EXISTS idx_persona_learning_log_time ON PersonaLearningLog(createdAt);

CREATE INDEX IF NOT EXISTS idx_persona_switch_log_user ON PersonaSwitchLog(userId);
CREATE INDEX IF NOT EXISTS idx_persona_switch_log_persona ON PersonaSwitchLog(newPersona);
CREATE INDEX IF NOT EXISTS idx_persona_switch_log_time ON PersonaSwitchLog(timestamp);

CREATE INDEX IF NOT EXISTS idx_proactive_question_persona ON ProactiveQuestionTemplate(personaType);
CREATE INDEX IF NOT EXISTS idx_proactive_question_category ON ProactiveQuestionTemplate(category);
CREATE INDEX IF NOT EXISTS idx_proactive_question_active ON ProactiveQuestionTemplate(isActive);