namespace EnemyState {
  export class AttackState extends EnemyStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 100;
    private timer: egret.Timer | null = null;

    constructor(enemy: Enemy) {
      super(enemy, "attack");

      this.directionRes = [
        "4021040_json",
        "4021041_json",
        "4021042_json",
        "4021043_json",
        "4021044_json",
        "4021043_json",
        "4021042_json",
        "4021041_json"
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
      if (this.enemy.target) {
        this.enemy.target.hurt(Math.random() * 200 + this.enemy.atk - 100);
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
