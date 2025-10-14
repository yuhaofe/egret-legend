namespace EnemyState {
  export class WalkState extends EnemyStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 100;

    constructor(enemy: Enemy) {
      super(enemy, "walk");

      this.directionRes = [
        "4021020_json",
        "4021021_json",
        "4021022_json",
        "4021023_json",
        "4021024_json",
        "4021023_json",
        "4021022_json",
        "4021021_json"
      ];
    }
    
    public enter(): void {
      super.enter();


    }
    
    public update(deltaTime: number): void {
      super.update(deltaTime);
    }
  }
}