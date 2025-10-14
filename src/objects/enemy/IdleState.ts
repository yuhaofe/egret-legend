namespace EnemyState {
  export class IdleState extends EnemyStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 0;
    constructor(enemy: Enemy) {
      super(enemy, "idle");

      this.directionRes = [
        "4021010_json",
        "4021011_json",
        "4021012_json",
        "4021013_json",
        "4021014_json",
        "4021013_json",
        "4021012_json",
        "4021011_json"
      ];;
    }
    
    public enter(): void {
      super.enter();

    }
    
    public update(deltaTime: number): void {
      super.update(deltaTime);
    }
  }
}