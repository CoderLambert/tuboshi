// 简单的事件总线，用于组件间通信
class EventBus {
  private events: { [key: string]: Function[] } = {}

  on(event: string, callback: Function) {
    if (!this.events[event])
      this.events[event] = []

    this.events[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(...args))
  }
}

export const eventBus = new EventBus()

// 事件类型
export const EVENTS = {
  SEND_MESSAGE: 'send_message',
} as const
