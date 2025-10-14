class GameScene extends BaseScene {
  private world: GameWorld;
  private ui: GameUI;

  constructor() {
    super();
    
    this.world = new GameWorld();
    this.addChild(this.world);

    this.ui = new GameUI();
    this.addChild(this.ui);
  }

  protected createChildren(): void {
    super.createChildren();
    this.percentWidth = 100;
    this.percentHeight = 100;
  }

  protected onUpdate(deltaTime: number): void {
    this.world.update(deltaTime);
    this.ui.update(deltaTime)
  }

  public getHpBarPos() {
    return this.ui.getHpBarPos();
  }
}