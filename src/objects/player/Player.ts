
class Player extends BaseGameObject {
  public maxHp: number = 10000;
  public hp: number = this.maxHp;
  public atk: number = 3000;
  // private mp: number = 0;
  // private exp: number = 0;
  // private level: number = 0;
  // private playerName: string = "";
  // private job: string = "";

  private image: egret.Bitmap | null = null;
  private nameLabel: egret.TextField | null = null;
  private aniSheets: Array<egret.SpriteSheet> = [];
  private curFrame: number = 0;
  
  private timer: egret.Timer | null = null;

  public direction: Direction = Direction.Up;
  public velocity: { x: number, y: number} = { x:0, y:0 };
  public isMoving: boolean = false;

  private idleState: PlayerState.IdleState = new PlayerState.IdleState(this);
  private walkState: PlayerState.WalkState = new PlayerState.WalkState(this);
  private attackState: PlayerState.AttackState = new PlayerState.AttackState(this);
  private fsm: StateMachine<PlayerStateBase> = new StateMachine(new EntryState(this, this.idleState));

  public target: Enemy | null = null;

  public isNav: boolean = false;
  private navPoint = { x: 0, y: 0 };

  private throttleDirection: Function;

  constructor() {
    super();

    this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
    this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
      this.fsm.currentState.exit();
    }, this);
    
    this.throttleDirection = Utils.throttle((player, point) => {
      const direction = Direction.Utils.getDirectionFromRectangle(Direction.Utils.centerToTopLeft(player), point);
      player.setDirection(direction);
    }, 300);
  }

  protected onAddedToStage() {
    super.onAddedToStage();

    this.width = 50;
    this.height = 100;
    this.anchorOffsetX = 25;
    this.anchorOffsetY = 50;

    this.curFrame = 0;

    this.image = new egret.Bitmap();
    this.image.x = 25;
    this.image.y = 50;
    this.addChild(this.image);

    this.nameLabel = new egret.TextField();
    this.nameLabel.text = JSON.parse(egret.localStorage.getItem("role")).name;
    this.nameLabel.fontFamily = "微软雅黑";
    this.nameLabel.stroke = 2;
    this.nameLabel.strokeColor = 0x0000f0;
    this.nameLabel.textColor = 0xffffff;
    this.nameLabel.size = 12;
    this.nameLabel.x = 0;
    this.nameLabel.y = -5;
    this.addChild(this.nameLabel);

    // this.hpLabel = new egret.TextField();
    // this.hpLabel.text = this.hp + "";
    // this.hpLabel.fontFamily = "微软雅黑";
    // this.hpLabel.stroke = 2;
    // this.hpLabel.strokeColor = 0xff0000;
    // this.hpLabel.textColor = 0xffffff;
    // this.hpLabel.size = 12;
    // this.hpLabel.x = this.width + 10;
    // this.hpLabel.y = -60;
    // this.addChild(this.hpLabel);

    this.fsm.start();
  }

  public async setDirection(direction: Direction) {
    if (direction === this.direction) {
      return;
    }

    this.direction = direction;
    const flip = [false, false, false, false, false, true, true, true];
    this.image && (this.image.scaleX = flip[direction] ? -1 : 1);
    this.fsm.currentState.setVelocity();
    this.curFrame = 0;
  }

  public playAnimation(aniSheets: egret.SpriteSheet[]) {
    this.aniSheets = aniSheets;
    if (this.timer && this.timer.running) {
      this.timer.stop();
    }
    const delay = 1000 / 8; 
    this.timer = new egret.Timer(delay, 0);
    this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimerTick, this);
    this.timer.start();
  }

  private onTimerTick() {
    const curSheet = this.aniSheets[this.direction];
    if (curSheet) {
      this.curFrame += 1;
      if (this.curFrame >= Object.keys(curSheet._textureMap).length) {
        this.curFrame = 0;
      }
      if (this.image) {
        this.image.texture = curSheet.getTexture(this.curFrame.toString());
        this.image.anchorOffsetX = this.image.width / 2;
        this.image.anchorOffsetY = this.image.height / 2 - 50;
      }
    }
  }

  public stopAnimation() {
    if (this.timer && this.timer.running) {
      this.timer.stop();
    }
  }

  public startNav(point: { x: number, y: number }) {
    this.isNav = true;
    this.navPoint = point;
    this.startMove();
  }

  public stopNav() {
    if (this.isNav) {
      this.isNav = false;
      this.stopMove();
    }
  }

  public startMove() {
    this.isMoving = true;
    this.fsm.currentState.setVelocity();
    if (!(this.fsm.currentState instanceof PlayerState.AttackState)) {
      this.fsm.changeState(this.walkState);
    }
  }

  public stopMove() {
    if (this.isMoving) {
      this.isMoving = false;
      this.fsm.currentState.setVelocity();
      if (!(this.fsm.currentState instanceof PlayerState.AttackState)) {
        this.fsm.changeState(this.idleState);
      }
    }
  }

  public attack(enemy: Enemy) {
    this.target = enemy;
    // const direction = Direction.Utils.getDirectionFromRectangle(this, { x:this.target.x, y:this.target.y });
    // this.setDirection(direction);
    this.fsm.changeState(this.attackState);
  }

  public stopAttack() {
    if (this.fsm.currentState instanceof PlayerState.AttackState) {
      if (this.isMoving) {
        this.fsm.changeState(this.walkState);
      } else {
        this.fsm.changeState(this.idleState);
      }
    }
  }

  protected onUpdate(deltaTime: number): void {
    this.fsm.currentState.update(deltaTime);

    if (this.isNav) {
      this.throttleDirection(this, this.navPoint);

      if(Direction.Utils.isPointInsideRectangle(Direction.Utils.centerToTopLeft(this), this.navPoint)) {
        this.stopNav();
      }
    }

    this.x += this.velocity.x * deltaTime / 1000;
    this.y += this.velocity.y * deltaTime / 1000;
  }

  public hurt(value: number): void {
    this.hp -= value;
    if (this.hp <= 0) {
      this.hp = 0;
      SceneManager.Instance.changeScene(new GameFailedScene());
    }

    EventBus.Instance.emit("HP_CHANGED", this.hp, this.maxHp);
  }

  public heal(value: number): void {
    this.hp += value;
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }

    EventBus.Instance.emit("HP_CHANGED", this.hp, this.maxHp);
  }

}