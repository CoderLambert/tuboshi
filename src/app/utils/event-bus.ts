// 简单的事件总线，用于组件间通信
class EventBus {
  private events: { [key: string]: ((...args: any[]) => void)[] } = {}

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) { this.events[event] = [] }

    this.events[event].push(callback)
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) { return }
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) { return }
    this.events[event].forEach(callback => callback(...args))
  }
}

export const eventBus = new EventBus()

// 事件类型
export const EVENTS = {
  SEND_MESSAGE: 'send_message',
} as const
