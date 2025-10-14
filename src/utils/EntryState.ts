class EntryState<T extends State> extends State {
  private _nextState: T;
  public get nextState() {
    return this._nextState;
  }

  constructor(owner: any, nextState: T) {
    super(owner, "entry");
    this._nextState = nextState;
  }

  public enter() {

  }
}