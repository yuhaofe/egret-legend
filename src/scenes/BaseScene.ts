/**
 * 场景基类
 */
class BaseScene extends eui.Component {
  private lastTime: number = 0;

  constructor() {
    super();
  }

  protected partAdded(partName: string, instance: any): void {
    super.partAdded(partName, instance);
  }

  protected createChildren(): void {
    super.createChildren();
    
    this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
      this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }, this);
  }

  protected childrenCreated(): void {
    super.childrenCreated();
  }

  private onEnterFrame() {
    let currentTime = egret.getTimer(); // 毫秒
        
    if (this.lastTime === 0) {
        this.lastTime = currentTime;
        return;
    }
    
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.onUpdate(deltaTime);
  }

  protected onUpdate(deltaTime: number) { }

}