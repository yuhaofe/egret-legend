namespace PlayerState {
  export class WalkState extends PlayerStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 200;

    constructor(player: Player) {
      super(player, "walk");

      this.directionRes = [
        "91018020_json",
        "91018021_json",
        "91018022_json",
        "91018023_json",
        "91018024_json",
        "91018023_json",
        "91018022_json",
        "91018021_json"
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