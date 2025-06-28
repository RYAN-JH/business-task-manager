// 콘솔 출력 유틸리티 - 한글 인코딩 문제 해결

export class ConsoleLogger {
  private static formatMessage(level: string, emoji: string, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const baseMessage = `[${timestamp}] ${emoji} ${level}: ${message}`;
    
    if (data) {
      return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  static info(message: string, data?: any): void {
    const formatted = this.formatMessage('INFO', 'ℹ️', message, data);
    console.log(formatted);
  }

  static success(message: string, data?: any): void {
    const formatted = this.formatMessage('SUCCESS', '✅', message, data);
    console.log(formatted);
  }

  static warning(message: string, data?: any): void {
    const formatted = this.formatMessage('WARNING', '⚠️', message, data);
    console.warn(formatted);
  }

  static error(message: string, data?: any): void {
    const formatted = this.formatMessage('ERROR', '❌', message, data);
    console.error(formatted);
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('DEBUG', '🔍', message, data);
      console.log(formatted);
    }
  }

  static admin(message: string, data?: any): void {
    const formatted = this.formatMessage('ADMIN', '🔑', message, data);
    console.log(formatted);
  }

  static persona(message: string, data?: any): void {
    const formatted = this.formatMessage('PERSONA', '🎭', message, data);
    console.log(formatted);
  }

  static ai(message: string, data?: any): void {
    const formatted = this.formatMessage('AI', '🤖', message, data);
    console.log(formatted);
  }

  // 기존 console.log를 대체하는 안전한 로거
  static log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
    ).join(' ');
    
    // UTF-8로 안전하게 출력
    process.stdout.write(Buffer.from(message + '\n', 'utf8'));
  }
}

// 편의 함수들
export const logger = ConsoleLogger;
export default ConsoleLogger;