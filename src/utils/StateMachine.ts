class StateMachine<T extends State> {
  private _currentState: T | EntryState<T>;
  private previousState: T | null = null;

  constructor(state: T | EntryState<T>) {
    this._currentState = state;
    this._currentState.enter();
  }

  public get currentState(): T {
    if (this._currentState instanceof EntryState) {
      throw new Error("状态机尚未启动，使用EntryState后请在初始化完成后手动调用状态机的start方法！");
    }
    return this._currentState;
  }

  public changeState(newState: T): boolean {
    if (this._currentState === newState) {
      return false;
    }

    if (!(this._currentState instanceof EntryState)) {
      this.previousState = this._currentState;
    }

    this._currentState.exit();
    this._currentState = newState;
    this._currentState.enter();

    return true;
  }

  public update(deltaTime: number) {
    if (!this._currentState) return;

    // 更新当前状态
    this._currentState.update(deltaTime);
  }

  public revertToPreviousState() {
    if (this.previousState) {
      this.changeState(this.previousState);
    }
  }

  public start() {
    if (this._currentState instanceof EntryState) {
      this.changeState(this._currentState.nextState);
    }
  }

  public isEntryState() {
    return this._currentState instanceof EntryState;
  }
}