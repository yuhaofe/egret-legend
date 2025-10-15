class StatusBar extends egret.DisplayObjectContainer {
  private _value: number = 0;
  private maxValue: number = 100;
  private length: number = 100;
  private thumb: egret.Shape;
  private background: egret.Shape;

  constructor(value: number, options?: { length?: number, maxValue?: number }) {
    super();

    this._value = value;
    options && options.length && (this.length = options.length);
    options && options.maxValue && (this.maxValue = options.maxValue);

    this.background = new egret.Shape();
    this.background.graphics.lineStyle(1, 0xffffff);
    this.background.graphics.beginFill(0x000000);
    this.background.graphics.drawRoundRect(0, 0, this.length + 1, 4, 2, 2);
    this.background.graphics.endFill();
    this.background.x = 0;
    this.background.y = 0;
    this.addChild(this.background);

    const thumbLength = this._value / this.maxValue * this.length;
    this.thumb = new egret.Shape();
    this.thumb.graphics.beginFill(0xff0000);
    this.thumb.graphics.drawRoundRect(1, 1, thumbLength, 3, 1, 1);
    this.thumb.graphics.endFill();
    this.thumb.x = 0;
    this.thumb.y = 0;
    this.addChild(this.thumb);
  }

  public get value(): number {
    return this._value;
  }

  public set value(value: number) {
    this._value = value;

    const thumbLength = this._value / this.maxValue * this.length;
    this.thumb.graphics.clear();
    this.thumb.graphics.beginFill(0xff0000);
    this.thumb.graphics.drawRoundRect(1, 1, thumbLength, 3, 1, 1);
    this.thumb.graphics.endFill();
  }
}