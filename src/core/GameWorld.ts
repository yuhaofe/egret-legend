class GameWorld extends egret.DisplayObjectContainer {
  private map!: Map;
  private player!: Player;
  // private enemy!: Enemy;
  private enemyList: Array<Enemy> = [];
  private itemList: Array<GameItem> = [];
  private touchLayer!: egret.Shape;
  private touchBeginTime: number = 0;
  private clickMC: egret.MovieClip | null = null;
  private killCount: number = 0;
  private targetKillCount: number = 10;

  constructor() {
    super();

    this.sortableChildren = true; // 开启子对象排序

    this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
  }

  private onAddedToStage() {
    this.map = new Map("kuLouDong");
    this.map.zIndex = 0;
    this.addChild(this.map);
    
    this.width = this.map.mapWidth;
    this.height = this.map.mapHeight;
    this.loadMap();

    this.touchLayer = new egret.Shape();
    this.touchLayer.zIndex = 1;
    this.touchLayer.touchEnabled = true;
    this.touchLayer.alpha = 0;
    this.touchLayer.graphics.beginFill(0x000000);
    this.touchLayer.graphics.drawRect(0, 0, this.map.mapWidth, this.map.mapHeight);
    this.touchLayer.graphics.endFill();
    this.addChild(this.touchLayer);

    this.player = new Player();
    this.player.x = 3800;
    this.player.y = 3500;
    this.player.zIndex = Math.floor(this.player.y);
    this.addChild(this.player);

    this.x = -this.player.x + 568;
    this.y = -this.player.y + 320;

    this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBackgroundTouchBegin, this);
    this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onBackgroundTouchMove, this);
    this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_END, this.onBackgroundTouchEnd, this);
    this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onBackgroundTouchCancel, this);
  }

  private async loadMap() {
    await this.map.loadData();
    this.enemyList = EnemyFactory.createEnemies(this, 100, this.map); // 生成敌人
    EventBus.Instance.emit("KILL_COUNT_CHANGED", this.killCount, this.targetKillCount);
  }

  private onBackgroundTouchBegin(event: egret.TouchEvent) {
    const direction = Direction.Utils.getDirectionFromRectangle(Direction.Utils.centerToTopLeft(this.player), { x:event.localX, y: event.localY });
    this.player.setDirection(direction);
    this.player.startNav({ x:event.localX, y: event.localY });
    this.touchBeginTime = egret.getTimer();

    this.playClickAnimation({ x: event.localX, y: event.localY });
  }

  private async playClickAnimation(point: {x:number, y: number}): Promise<void> {
    if (!this.clickMC) {
      const data = await RES.getResAsync("click_json"); // json类型直接返回对象
      const texture: egret.Texture = await RES.getResAsync("click_png"); // 图像类型直接返回Texture

      const mcDataFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, texture);
      this.clickMC = new egret.MovieClip(mcDataFactory.generateMovieClipData("click"));
      this.clickMC.anchorOffsetX = this.clickMC.width / 2;
      this.clickMC.anchorOffsetY = this.clickMC.height / 2;
      this.clickMC.blendMode = egret.BlendMode.ADD;
      this.clickMC.scaleY = 0.6;
    }

    this.addChild(this.clickMC);
    this.clickMC.x = point.x;
    this.clickMC.y = point.y;
    

    this.clickMC.gotoAndPlay("click",  1);
    this.clickMC.addEventListener(egret.MovieClipEvent.COMPLETE, () => {
      this.clickMC && this.removeChild(this.clickMC);
      this.clickMC = null;
    }, this);
  }

  private onBackgroundTouchMove(event: egret.TouchEvent) {
    const currentTime = egret.getTimer();
    if (currentTime - this.touchBeginTime < 200) {
      return;
    }
    
    this.player.stopNav();

    const direction = Direction.Utils.getDirectionFromRectangle(Direction.Utils.centerToTopLeft(this.player), { x:event.localX, y: event.localY });
    this.player.setDirection(direction);
    this.player.startMove();
  }

  private onBackgroundTouchEnd(event: egret.TouchEvent) {
    const currentTime = egret.getTimer();
    if (currentTime - this.touchBeginTime < 200) {
      return;
    }
    this.player.stopMove();
  }

  private onBackgroundTouchCancel(event: egret.TouchEvent) {
    this.player.stopNav();
    this.player.stopMove();
  }

  private checkCollision(gameObject: BaseGameObject): boolean {
    // 获取玩家和怪物的矩形边界
    let playerRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height
    }
    let gameObjectRect = {
      x: gameObject.x,
      y: gameObject.y,
      width: gameObject.width,
      height: gameObject.height
    };
    
    // 矩形碰撞检测
    return !(
        playerRect.x + playerRect.width < gameObjectRect.x ||
        playerRect.x > gameObjectRect.x + gameObjectRect.width ||
        playerRect.y + playerRect.height < gameObjectRect.y ||
        playerRect.y > gameObjectRect.y + gameObjectRect.height
    );
  }

  public update(deltaTime: number): void {
    // 攻击相关
    let playAttack = false;
    for (const enemy of this.enemyList) {
      if (this.checkCollision(enemy) && this.player.hp > 0 && enemy.hp > 0 && this.player.isNav === false) {
        playAttack = true;
        this.player.attack(enemy);
        enemy.attack(this.player);
      } else {
        enemy.stopAttack();
      }
    }
    !playAttack && this.player.stopAttack();

    // 道具拾取
    for (const item of this.itemList) {
      if (this.checkCollision(item) && this.player.hp > 0) {
        item.consume(this.player, (this.parent as GameScene).getHpBarPos());
      }
    }

    // 阻挡检测
    const walkable = this.map.isNextBlockWalkable(this.player.x, this.player.y, this.player.direction);
    if (!walkable) {
      this.player.stopNav();
      this.player.velocity = { x:0, y:0 };
      //this.player.stopMove();
    }
    this.enemyList.forEach((enemy) => {
      const walkable = this.map.isNextBlockWalkable(enemy.x, enemy.y, enemy.direction);
      if (!walkable) {
        enemy.stopMove();
      }
    })

    // 遮挡检测
    const covered = this.map.isBlockCovered(this.player.x, this.player.y);
    this.player.alpha = covered ? 0.6 : 1;
    this.enemyList.forEach((enemy) => {
      const covered = this.map.isBlockCovered(enemy.x, enemy.y);
      enemy.alpha = covered ? 0.6 : 1;
    })

    // 通知UI
    EventBus.Instance.emit("PLAYER_MOVED", this.player, this.map);

    // 将角色保持在屏幕中心
    let stageW = this.stage.stageWidth;
    let stageH = this.stage.stageHeight;
    
    // 计算相机应该移动到的位置(负值,因为是移动世界而不是相机)
    let targetX = stageW / 2 - this.player.x;
    let targetY = stageH / 2 - this.player.y;
    
    targetX = Math.min(0, targetX);
    targetX = Math.max(stageW - this.map.mapWidth, targetX);
    targetY = Math.min(0, targetY);
    targetY = Math.max(stageH - this.map.mapHeight, targetY);
    
    // 平滑移动
    let smoothSpeed = 0.15;
    this.x += (targetX - this.x) * smoothSpeed;
    this.y += (targetY - this.y) * smoothSpeed;
    
    // 更新瓦片显示
    this.map.updateVisibleTiles(
        this.x,
        this.y,
        stageW,
        stageH
    );

    // 更新zIndex，2.5D视角的对象实际上Y轴值越大，层级越靠前
    this.player.zIndex = Math.floor(this.player.y);
    this.enemyList.forEach(enemy => {
      enemy.zIndex = Math.floor(enemy.y);
    });
  }

  public addKillCount() {
    this.killCount += 1;
    EventBus.Instance.emit("KILL_COUNT_CHANGED", this.killCount, this.targetKillCount);
    if (this.killCount >= this.targetKillCount) {
      SceneManager.Instance.changeScene(new GameSuccessScene());
    }
  }

  public addItem(item: GameItem) {
    this.itemList.push(item);
  }

  public removeItem(item: GameItem) {
    this.itemList = this.itemList.filter(i => i !== item);
  }
}