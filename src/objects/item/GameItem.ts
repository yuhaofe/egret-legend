class GameItem extends BaseGameObject {
  private image: egret.Bitmap | null = null;
  private healCount: number = 1500;
  private spawnTime: number = 0;
  private inAnime: boolean = false;

  constructor() {
    super();
  }

  protected async onAddedToStage() {
    const texture = await RES.getResAsync("item_png");
    this.image = new egret.Bitmap(texture);
    this.image.anchorOffsetX = this.image.width / 2;
    this.image.anchorOffsetY = this.image.height / 2;
    this.addChild(this.image);

    this.spawnTime = egret.getTimer();
  }

  public consume(player: Player, hpBarPos: { x: number, y: number}) {
    if (!this.inAnime && (egret.getTimer() - this.spawnTime > 1000)) {
      const hpBarWorldPos = this.parent.globalToLocal(hpBarPos.x, hpBarPos.y);

      const peakY = this.y - 100;
      const endY = hpBarWorldPos.y - 30;
      const endX = hpBarWorldPos.x + 300;

      this.inAnime = true;

      // 抛物线动画
      egret.Tween.get(this)
          .to({x: endX}, 600);

      egret.Tween.get(this)
          .to({y: peakY}, 300, egret.Ease.sineOut) // 上升,速度递减
          .to({y: endY}, 300, egret.Ease.sineIn)  // 下降,速度递增  
          .call(() => {
            player.heal(this.healCount);
            (this.parent as GameWorld).removeItem(this);
            this.parent && this.parent.removeChild(this);
          });
    }
  }
}