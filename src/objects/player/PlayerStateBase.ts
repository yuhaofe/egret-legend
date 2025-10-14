abstract class PlayerStateBase extends State {
  protected player: Player;
  protected directionRes: Array<any> = [];
  protected _moveSpeed: number = 0;
  public get moveSpeed() {
    return this._moveSpeed;
  }

  constructor(player: Player, stateName: string) {
      super(player, stateName);
      this.player = player;
  }

  public enter(): void {
    super.enter();

    this.setVelocity();
    this.playAnimation();
  }
    
  protected async playAnimation() {
    if (this.directionRes.length > 0) {
      const aniSheetPromise = this.directionRes.map(async (key): Promise<egret.SpriteSheet> => {
        return await RES.getResAsync(key);
      })
      const aniSheets = await Promise.all(aniSheetPromise);
      this.player.playAnimation(aniSheets);
    }
  }

  public setVelocity() {
    // 根据方向设置x,y方向速度
    const moveDirection = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    const moveDX = moveDirection[this.player.direction][0];
    const moveDY = moveDirection[this.player.direction][1];

    // 向量归一化来保证所有方向的速度一致
    const length = Math.sqrt(moveDX * moveDX + moveDY * moveDY);
    const normalizedX = moveDX / length;
    const normalizedY = moveDY / length;
    const moveSpeed = this.player.isMoving ? this.moveSpeed : 0;
    this.player.velocity.x = normalizedX * moveSpeed;
    this.player.velocity.y = normalizedY * moveSpeed;
  }
}