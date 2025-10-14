class BaseGameObject extends egret.DisplayObjectContainer {
  private lastTime: number = 0;

  constructor() {
    super();

    this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
  }

  protected onAddedToStage() {
    this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
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