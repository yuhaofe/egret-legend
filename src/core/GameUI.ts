
class GameUI extends eui.Component {
  private hpBar!: eui.ProgressBar;
  private miniMapContainer!: eui.Component;
  private miniMap: egret.Bitmap | null = null;
  private killCountLabel!: eui.Label;

  constructor() {
    super();
  }

  protected partAdded(partName: string, instance: any): void {
    super.partAdded(partName, instance);
  }

  protected createChildren(): void {
    super.createChildren();
    this.percentWidth = 100;
    this.percentHeight = 100;
  }

  protected childrenCreated(): void {
    super.childrenCreated();

    EventBus.Instance.on("HP_CHANGED", (hp: number, maxHp: number) => {
      egret.Tween.removeTweens(this.hpBar);
      const tween = egret.Tween.get(this.hpBar);
      tween.to({ value: hp / maxHp * this.hpBar.maximum }, 200, egret.Ease.cubicIn);
    });

    EventBus.Instance.once("MINIMAP_LOADED", (minimap: egret.Texture) => {
      console.log("MINIMAP_LOADED");

      this.validateNow();
      egret.callLater(() => {
        console.log(this.miniMapContainer.width, this.miniMapContainer.height)
        this.miniMap = new egret.Bitmap();
        this.miniMap.scrollRect = new egret.Rectangle(0, 0, this.miniMapContainer.width, this.miniMapContainer.height);
        console.log(this.miniMap.scrollRect.width, this.miniMap.scrollRect.height)
        this.miniMapContainer.addChild(this.miniMap);
        this.miniMap.texture = minimap;
      }, this);

    });

    EventBus.Instance.on("PLAYER_MOVED", (player: Player, map: Map) => {
      if (!this.miniMap) {
        this.miniMap = new egret.Bitmap();
        this.miniMap.scrollRect = new egret.Rectangle(0, 0, this.miniMapContainer.width, this.miniMapContainer.height);
        this.miniMapContainer.addChild(this.miniMap);
      }
      this.miniMap.scrollRect.x = player.x / map.mapWidth * this.miniMap.width - this.miniMapContainer.width / 2;
      this.miniMap.scrollRect.y = player.y / map.mapHeight * this.miniMap.height - this.miniMapContainer.height / 2;
    });

    EventBus.Instance.on("KILL_COUNT_CHANGED", (count: number, target: number) => {
      this.killCountLabel.text = `击杀数量：${count} / ${target}`;
    })
  }

  public update(deltaTime: number) {

  }

  public getHpBarPos() {
    return { x: this.hpBar.x, y: this.hpBar.y };
  }
}