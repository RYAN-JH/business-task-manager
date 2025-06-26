// app/chat/page.js
import TaskGeniusChatbot from '../../components/TaskGeniusChatbot';

export default function ChatPage() {
  return <TaskGeniusChatbot />;
}

export const metadata = {
  title: 'TaskGenius AI Chat - 스마트 작업 관리 어시스턴트',
  description: 'AI 기반 작업 관리 및 프로젝트 계획 도우미',
};