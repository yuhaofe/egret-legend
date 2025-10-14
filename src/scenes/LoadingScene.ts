class LoadingScene extends BaseScene implements RES.PromiseTaskReporter {
  public progressBar!: eui.ProgressBar;
  private loadGroup: string;
  private nextScene: BaseScene;
  private fileLabel!: eui.Label;

  constructor(loadGroup: string, nextScene: BaseScene) {
    super();
    this.loadGroup = loadGroup;
    this.nextScene = nextScene;
    // 在default.thm.json中配置这里就不需要
    // this.skinName = "resource/eui_skins/LoadingSceneSkin.exml";
  }

  protected createChildren(): void {
    super.createChildren();
    this.percentWidth = 100;
    this.percentHeight = 100;
  }

  protected childrenCreated(): void {
    super.childrenCreated();
    this.initProgressBar();
    this.loadAssets();
    // this.simulateProgress();
  }

  private initProgressBar(): void {
    this.progressBar.maximum = 100;
    this.progressBar.value = 0;
    this.progressBar.slideDuration = 0;
    this.progressBar.labelFunction = (value, maximum): string => {
      return `正在加载中……（${value}%）`;
    };
  }

  private async loadAssets(): Promise<void> {
    await RES.loadGroup(this.loadGroup, 0, this);
  }

  /**
   * RES分组加载的回调
   */
  public onProgress(current: number, total: number,  resItem: RES.ResourceInfo | undefined): void {
    console.log(`正在加载${resItem?.name}（${current}/${total}）`);
    this.fileLabel.text = "文件：" + (resItem ? resItem.name : '');
    egret.Tween.removeTweens(this.progressBar);

    let currentProgress = Math.floor(current / total * this.progressBar.maximum);
    egret.Tween.get(this.progressBar)
      .to({ value: currentProgress }, 3000, egret.Ease.cubicOut)
      .call(() => {
        if (currentProgress >= this.progressBar.maximum) {
          SceneManager.Instance.changeScene(this.nextScene);
        }
      });

  }

  // 模拟进度的方法
  private simulateProgress(): void {
    let currentProgress = 0;

    let timer = new egret.Timer(500);
    timer.addEventListener(egret.TimerEvent.TIMER, () => {
        currentProgress += 20;
        if (currentProgress > this.progressBar.maximum) {
            currentProgress = this.progressBar.maximum;
            timer.stop(); // 达到最大值时停止定时器

            SceneManager.Instance.changeScene(new RoleCreationScene());
        }
        // 使用tween设置滚动条进度
        egret.Tween.get(this.progressBar)
          .to({ value: currentProgress }, 500, egret.Ease.cubicOut);
    }, this);
    timer.start();
  }
}