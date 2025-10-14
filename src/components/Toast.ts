class Toast extends eui.Component {
  private static _instance: Toast;
  private message: string = "";
  private timer: number = 0;
  private static rootContainer: eui.UILayer;

  constructor() {
    super();
  }

  public static setup(rootContainer:  eui.UILayer): void {
    this.rootContainer = rootContainer;
  }

  protected partAdded(partName: string, instance: any): void {
    super.partAdded(partName, instance);
  }

  protected createChildren(): void {
    super.createChildren();
    this.alpha = 0;
    this.bottom = 50;
    this.horizontalCenter = 0;
  }

  protected childrenCreated(): void {
    super.childrenCreated();
  }

  public static show(message: string, duration: number = 3000): void {
    if (!Toast._instance || !Toast._instance.parent) {
      Toast._instance = new Toast();
      this.rootContainer.addChild(Toast._instance);
    }
    Toast._instance.message = message;
    if (Toast._instance.timer) {
      egret.clearTimeout(Toast._instance.timer);
    }
    egret.Tween.get(Toast._instance)
      .to({ alpha: 1 }, 200);
    Toast._instance.timer = egret.setTimeout(() => {
      Toast.hide();
    }, Toast._instance, duration);
  }

  public static hide(): void {
    if (Toast._instance && Toast._instance.parent) {
      egret.Tween.get(Toast._instance)
        .to({ alpha: 0 }, 200)
        .call(() => {
          if (Toast._instance.parent) {
              this.rootContainer.removeChild(Toast._instance);
          }
        });
    }
  }
}