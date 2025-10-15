class Enemy extends BaseGameObject {
  private maxHp: number = 10000;
  public hp: number = this.maxHp;
  public atk: number = 500;
  // private mp: number = 0;

  public direction: Direction = Direction.Down;

  private image: egret.Bitmap | null = null;
  private nameLabel: egret.TextField | null = null;
  private hpBar: StatusBar | null = null;
  private bmpfont: egret.BitmapFont | null = null;

  public aniSheets: Array<egret.SpriteSheet> = [];
  private curFrame: number = 0;
  
  private timer: egret.Timer | null = null;
  private autoMoveTimer: egret.Timer | null = null;

  public isMoving: boolean = false;
  public velocity: { x: number, y: number} = { x:0, y:0 };

  private idleState: EnemyState.IdleState = new EnemyState.IdleState(this);
  private walkState: EnemyState.WalkState = new EnemyState.WalkState(this);
  private attackState: EnemyState.AttackState = new EnemyState.AttackState(this);
  private fsm: StateMachine<EnemyStateBase> = new StateMachine(new EntryState(this, this.idleState));

  public target: Player | null = null;

  constructor() {
    super();

    this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
    this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
      this.fsm.currentState.exit();
    }, this);
  }

  protected async onAddedToStage() {
    super.onAddedToStage();

    this.width = 80;
    this.height = 90;
    this.anchorOffsetX = 40;
    this.anchorOffsetY = 45;

    this.curFrame = 0;

    this.image = new egret.Bitmap();
    this.image.x = 40;
    this.image.y = 45;
    this.addChild(this.image);

    this.nameLabel = new egret.TextField();
    this.nameLabel.text = "骷髅士兵";
    this.nameLabel.fontFamily = "微软雅黑";
    this.nameLabel.stroke = 2;
    this.nameLabel.strokeColor = 0x000000;
    this.nameLabel.textColor = 0xffffff;
    this.nameLabel.size = 12;
    this.nameLabel.x = 15;
    this.nameLabel.y = this.height;
    this.addChild(this.nameLabel);

    this.hpBar = new StatusBar(this.hp, { length: 80, maxValue: this.maxHp });
    this.hpBar.x = 0;
    this.hpBar.y = 0;
    this.hpBar.alpha = 0;
    this.addChild(this.hpBar);

    this.fsm.start();
    this.autoMove();

    this.bmpfont = await RES.getResAsync("bossTipFont_fnt");
  }

  public setHp(value: number) {
    this.hp = value;

    if(this.hpBar) {
      // 每次添加动画前移除之前同样的动画
      egret.Tween.removeTweens(this.hpBar);
      const tween = egret.Tween.get(this.hpBar);
      // 将HP栏变化缓动处理
      tween.to({ value: this.hp }, 200, egret.Ease.circIn);
    }
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
    this.curFrame += 1;
    if (this.curFrame >= Object.keys(curSheet._textureMap).length) {
      this.curFrame = 0;
    }
    if (this.image) {
      this.image.texture = curSheet.getTexture(this.curFrame.toString());
      this.image.anchorOffsetX = this.image.width / 2 + 25;
      this.image.anchorOffsetY = this.image.height / 2 - 25;
    }
  }

  public stopAnimation() {
    if (this.timer && this.timer.running) {
      this.timer.stop();
    }
  }

  public startMove() {
    this.isMoving = true;
    this.fsm.currentState.setVelocity();
    if (!(this.fsm.currentState instanceof EnemyState.AttackState)) {
      this.fsm.changeState(this.walkState);
    }
  }

  public stopMove() {
    this.isMoving = false;
    this.fsm.currentState.setVelocity();
    if (!(this.fsm.currentState instanceof EnemyState.AttackState)) {
      this.fsm.changeState(this.idleState);
    }
  }

  protected onUpdate(deltaTime: number): void {
    this.fsm.currentState.update(deltaTime);

    this.x += this.velocity.x * deltaTime / 1000;
    this.y += this.velocity.y * deltaTime / 1000;

  
    this.hpBar && (this.hpBar.alpha = this.hp === this.maxHp ? 0 : 1);
  }

  private autoMove() {
    this.startMove();
    const autoMoveRules = [
      {
        interval: 800 + Math.round(Math.random() * 800),
        direction: Math.round(Math.random() * 7),
        moveFunc: () => {
          const direction = this.direction + 1;
          if (direction > 7) {
            this.setDirection(direction - 8);
          } else {
            this.setDirection(direction);
          }
          this.startMove();
        }
      },
      {
        interval: 800 + Math.round(Math.random() * 800),
        direction: Math.round(Math.random() * 7),
        moveFunc: () => {
          const direction = this.direction - 1;
          if (direction < 0) {
            this.setDirection(direction + 8);
          } else {
            this.setDirection(direction);
          }
          this.startMove();
        }
      },
      {
        interval: 800 + Math.round(Math.random() * 800),
        direction: Math.round(Math.random() * 7),
        moveFunc: () => {
          const direction = this.direction - 2;
          if (direction < 0) {
            this.setDirection(direction + 8);
          } else {
            this.setDirection(direction);
          }
          this.startMove();
        }
      },
      {
        interval: 800 + Math.round(Math.random() * 800),
        direction: Math.round(Math.random() * 7),
        moveFunc: () => {
          const direction = this.direction + 2;
          if (direction > 7) {
            this.setDirection(direction - 8);
          } else {
            this.setDirection(direction);
          }
          this.startMove();
        }
      },
      {
        interval: 1000 + Math.round(Math.random() * 1000),
        direction: Math.round(Math.random() * 7),
        moveFunc: () => {
          const direction = this.direction + 4;
           if (direction < 0) {
            this.setDirection(direction + 8);
          } else if (direction > 7) {
            this.setDirection(direction - 8);
          } else {
            this.setDirection(direction);
          }
          this.startMove();
        }
      },
    ];
    const rule = autoMoveRules[Math.round(Math.random() * (autoMoveRules.length - 1))];
    this.setDirection(rule.direction);
    this.autoMoveTimer = new egret.Timer(rule.interval, 0);
    this.autoMoveTimer.addEventListener(egret.TimerEvent.TIMER, rule.moveFunc, this);
    this.autoMoveTimer.start();
  }

  private stopAutoMove() {
    if (this.autoMoveTimer && this.autoMoveTimer.running) {
      this.autoMoveTimer.stop();
    }
    this.stopMove();
  }

  public attack(player: Player) {
    this.stopAutoMove();

    this.target = player;
    const direction = Direction.Utils.getDirectionFromRectangle(Direction.Utils.centerToTopLeft(this), { x:this.target.x, y:this.target.y });
    this.setDirection(direction);
    this.fsm.changeState(this.attackState);
  }

  public stopAttack() {
    if (!this.autoMoveTimer || !this.autoMoveTimer.running) {
      this.autoMove();
    }
    
    if (this.fsm.currentState instanceof EnemyState.AttackState) {
      if (this.isMoving) {
        this.fsm.changeState(this.walkState);
      } else {
        this.fsm.changeState(this.idleState);
      }
    }
  }

  public hurt(value: number): void {
    this.showHurtNumber(value);
    this.setHp(this.hp - value);
    if (this.hp <= 0) {
      this.setHp(0);

      const world = this.parent as GameWorld;
      world.addItem(GameItemFactory.spawnItem(world, this.x, this.y));
      world.addKillCount();
      world.removeChild(this);  
    }
  }

  // 用位图字体展示伤害数字，动画完成后移除出场景
  private showHurtNumber(num: number) {
    if (this.bmpfont) {
      const text = new egret.BitmapText();
      text.font = this.bmpfont;
      text.text = Math.floor(num) + "";
      text.x = this.width - 30;
      text.y = this.height / 2 - 10;
      text.scaleX = 0.3;
      text.scaleY = 0.3;
      text.skewX = 20;
      this.addChild(text);

      egret.Tween.get(text)
        .to({ x: 70, y: -50, alpha: 30 }, 800, egret.Ease.circIn)
        .call(() => {
          this.removeChild(text);
        })
    }
  }
}