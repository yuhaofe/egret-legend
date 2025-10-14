class GameFailedScene extends BaseScene {
  private restartBtn!: eui.Button;

  constructor() {
    super();

  }

  protected createChildren(): void {
    super.createChildren();
    this.percentWidth = 100;
    this.percentHeight = 100;
  }

  protected childrenCreated(): void {
    super.childrenCreated();
    this.restartBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestartBtnTap, this);
  }

  private onRestartBtnTap() {
    SceneManager.Instance.changeScene(new LoadingScene("role_creation", new RoleCreationScene()));
  }
}