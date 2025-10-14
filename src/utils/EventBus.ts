// EventBus.ts
type Listener = (...args: any[]) => void;
type ListenersMap = { [event: string]: { listener: Listener; once: boolean }[] };

class EventBus {
    private static _instance: EventBus;
    public static get Instance(): EventBus {
        if (!this._instance) {
            this._instance = new EventBus();
        }
        return this._instance;
    }

    private listeners: ListenersMap = {};

    /**
     * 订阅事件（多次触发）
     * @param event 事件名称
     * @param listener 回调函数
     */
    public on(event: string, listener: Listener): void {
        this.addListener(event, listener, false);
    }

    /**
     * 一次性订阅事件（触发一次后自动移除）
     * @param event 事件名称
     * @param listener 回调函数
     */
    public once(event: string, listener: Listener): void {
        this.addListener(event, listener, true);
    }

    /**
     * 发布事件（触发所有订阅者）
     * @param event 事件名称
     * @param args 传递给回调的参数
     */
    public emit(event: string, ...args: any[]): void {
        const eventListeners = this.listeners[event];
        if (!eventListeners || eventListeners.length === 0) return;

        // 复制数组以避免在迭代中修改
        const toRemove: { listener: Listener; once: boolean }[] = [];
        eventListeners.forEach(({ listener, once }) => {
            listener.apply(null, args);
            if (once) {
                toRemove.push({ listener, once });
            }
        });

        // 移除一次性监听器
        toRemove.forEach(({ listener, once }) => {
            this.removeListener(event, listener);
        });
    }

    /**
     * 取消订阅指定事件的所有监听器
     * @param event 事件名称
     */
    public off(event: string): void {
        delete this.listeners[event];
    }

    /**
     * 取消订阅指定事件和监听器
     * @param event 事件名称
     * @param listener 回调函数
     */
    public offListener(event: string, listener: Listener): void {
        this.removeListener(event, listener);
    }

    /**
     * 移除所有事件的所有监听器
     */
    public clear(): void {
        this.listeners = {};
    }

    private addListener(event: string, listener: Listener, once: boolean): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        const eventListeners = this.listeners[event];
        // 避免重复添加相同监听器
        if (!eventListeners.some(({ listener: l }) => l === listener)) {
            eventListeners.push({ listener, once });
        }
    }

    private removeListener(event: string, listener: Listener): void {
        const eventListeners = this.listeners[event];
        if (!eventListeners) return;

        let index = -1;
        eventListeners.some((item, i) => {
          return item.listener === listener && (index = i, true);
        });
        if (index > -1) {
            eventListeners.splice(index, 1);
            if (eventListeners.length === 0) {
                delete this.listeners[event];
            }
        }
    }
}