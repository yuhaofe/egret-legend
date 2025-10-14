interface Role {
  name: string,
  level: number,
  job: string
}

class RoleCreationScene extends BaseScene {
  private charactorGroup!: eui.Group;
  private charactorImg!: eui.Image;
  private nameInput!: eui.EditableText;
  private diceBtn!: eui.Button;
  private submitBtn!: eui.Button;
  private createBtn!: eui.Button;
  private deleteBtn!: eui.Button;
  private startBtn!: eui.Button;
  private recoverBtn!: eui.Button;
  private backBtn!: eui.Button;
  private creationPanel!: eui.Group;
  private role: Role | null = null;

  constructor() {
    super();
  }

  protected createChildren(): void {
    super.createChildren();
    this.percentWidth = 100;
    this.percentHeight = 100;
  }

  protected childrenCreated(): void {
    super.childrenCreated();
    this.loadRole();
    if (!this.role) {
      this.onCreateBtnTap();
    }
    this.createMovieClip();
    this.diceBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onDiceBtnTap, this);
    this.submitBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSubmitBtnTap, this);
    this.createBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateBtnTap, this);
    this.deleteBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onDeleteBtnTap, this);
    this.startBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onStartBtnTap, this);
    this.recoverBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRecoverBtnTap, this);
    this.backBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBackBtnTap, this);
  }

  private onDiceBtnTap() {
    const nameList = [ '破晓之刃', '暮光守护', '星辰之眼', '暗影猎手', '圣光牧师', '巨龙之息', '冰霜女王', '烈焰法师', '深海歌者', '死亡领主', '风暴领主', '森林之子', '虚空行者', '堕落天使', '蛮族战斧', '秘银工匠', '遗忘之人', '幻术大师', '圣光骑士', '死亡骑士' ];
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];
    this.nameInput.text = randomName;
  }

  private onSubmitBtnTap() {
    const name = this.nameInput.text.trim();
    egret.localStorage.setItem("role", JSON.stringify({
      name: name,
      level: 0,
      job: "战士"
    }));
    this.creationPanel.visible = false;
    this.loadRole();
    Toast.show("角色已成功创建");
  }

  private onCreateBtnTap() {
    if (!this.role) {
      this.creationPanel.visible = true;
    } else {
      Toast.show("角色已存在！");
    }
  }

  private onDeleteBtnTap() {
    if (this.role) {
      egret.localStorage.removeItem("role");
      this.role = null;
      Toast.show("角色已删除");
    } else {
      Toast.show("角色不存在！");
    }
  }

  private onStartBtnTap() {
    if (this.role) {
      SceneManager.Instance.changeScene(new LoadingScene("game_scene", new GameScene()));
    } else {
      Toast.show("角色不存在，请先创建角色！");
    }
  }

  private onRecoverBtnTap() {
    Toast.show("请联系客服处理！");
  }

  private onBackBtnTap() {
    SceneManager.Instance.changeScene(new LoadingScene("role_creation", new RoleCreationScene()));
  }
  
  private loadRole() {
    const roleJSON = egret.localStorage.getItem("role");
    if (roleJSON) {
      const role = JSON.parse(roleJSON);
      this.role = role;
    } else {
      this.role = null;
    }
  }

  private async createMovieClip(): Promise<void> {
    const data = await RES.getResAsync("carrer1_1_json"); // json类型直接返回对象
    const texture: egret.Texture = await RES.getResAsync("carrer1_1_png"); // 图像类型直接返回Texture

    const mcDataFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, texture);
    const mc: egret.MovieClip = new egret.MovieClip(mcDataFactory.generateMovieClipData("carrer1_1"));
    
    // 将占位图像的大小同步到MC
    mc.width = this.charactorImg.width;
    mc.height = this.charactorImg.height;
    mc.x = this.charactorImg.x;
    mc.y = this.charactorImg.y;
    this.charactorGroup.addChild(mc);
    this.charactorImg.alpha = 0;

    mc.gotoAndPlay("carrer1_1",  -1);
  }
}