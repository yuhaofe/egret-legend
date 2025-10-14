namespace PlayerState {
  export class IdleState extends PlayerStateBase {
    protected directionRes: Array<any>;
    protected _moveSpeed: number = 0;
    constructor(player: Player) {
      super(player, "idle");

      this.directionRes = [
        "91018010_json",
        "91018011_json",
        "91018012_json",
        "91018013_json",
        "91018014_json",
        "91018013_json",
        "91018012_json",
        "91018011_json"
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