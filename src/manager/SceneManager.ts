/**
 * 场景管理器，使用单例模式（谨慎使用）
 */ 
class SceneManager {
  private static _instance: SceneManager;
  public rootContainer: egret.DisplayObjectContainer | null = null;
  private currentScene: BaseScene | null = null;

  constructor() { }

  /**
   * 获取场景管理器实例
   */
  public static get Instance(): SceneManager {
    if (!this._instance) {
      this._instance = new SceneManager();
    }
    return this._instance;
  }

  /**
   * 初始化场景管理器
   * @param rootContainer 添加场景的根容器
   */
  public static setup(rootContainer: egret.DisplayObjectContainer): void {
    SceneManager.Instance.rootContainer = rootContainer;
  }
  
  /**
   * 切换场景
   * @param scene 要切换到的场景
   * @returns 
   */
  public changeScene(scene: BaseScene): void {
    if (!this.rootContainer) {
      console.error("未设置场景根容器！");
      return;
    }

    if(this.currentScene){
        this.rootContainer.removeChild(this.currentScene);
        this.currentScene = null;
    }
    this.rootContainer.addChild(scene);
    this.currentScene = scene;
  }
}