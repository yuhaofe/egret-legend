class Utils {

  // 节流函数
  public static throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options: { leading?: boolean; trailing?: boolean } = {}
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof egret.setTimeout> | null = null;
    let previous = 0;
    let context: any;
    let args: Parameters<T>;

    const { leading = true, trailing = true } = options;

    const later = () => {
      previous = leading === false ? 0 : Date.now();
      timeout = null;
      func.apply(context, args);
    };

    return function (this: any, ...funcArgs: Parameters<T>) {
      const now = Date.now();
      
      // 首次触发且 leading 为 false 时，设置 previous 为当前时间
      if (!previous && leading === false) {
        previous = now;
      }

      const remaining = wait - (now - previous);
      context = this;
      args = funcArgs;

      // 超过间隔时间，立即执行
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          egret.clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
      } 
      // 在间隔时间内，且 trailing 为 true，设置定时器
      else if (!timeout && trailing) {
        timeout = egret.setTimeout(later, this, remaining);
      }
    }
  }
}