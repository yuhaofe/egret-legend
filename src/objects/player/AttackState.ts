namespace PlayerState {
  export class AttackState extends PlayerStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 100;
    private timer: egret.Timer | null = null;

    constructor(player: Player) {
      super(player, "attack");

      this.directionRes = [
        "91018040_json",
        "91018041_json",
        "91018042_json",
        "91018043_json",
        "91018044_json",
        "91018043_json",
        "91018042_json",
        "91018041_json"
      ];;
    }
    
    public enter(): void {
      super.enter();

      if (this.timer && this.timer.running) {
        this.timer.stop();
      }
      const delay = 900; 
      this.timer = new egret.Timer(delay, 0);
      this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimerTick, this);
      this.timer.start();
    }

    private onTimerTick() {
      if (this.player.target) {
              if (this.player.target) {
        const direction = Direction.Utils.getDirectionFromRectangle(Direction.Utils.centerToTopLeft(this.player), { x: this.player.target.x, y: this.player.target.y });
        this.player.setDirection(direction);
      }
        this.player.target.hurt(Math.random() * 200 + this.player.atk - 100);
      }
    }
    
    public update(deltaTime: number): void {
      super.update(deltaTime);


    }

    public exit(): void {
      super.exit();

      if (this.timer && this.timer.running) {
        this.timer.stop();
      }
    }
  }
}
