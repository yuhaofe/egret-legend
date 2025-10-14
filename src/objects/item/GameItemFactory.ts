class GameItemFactory {

  public static spawnItem(world: GameWorld, x: number, y: number) {
    const item = new GameItem();
    item.x = x;
    item.y = y;
    item.scaleX = 0.8;
    item.scaleY = 0.8;
    const peakY = item.y - 50;
    const endY = item.y + 30;
    const endX = item.x + 10;

    egret.Tween.get(item)
        .to({x: endX}, 600);

    egret.Tween.get(item)
        .to({y: peakY}, 300, egret.Ease.sineOut) // 上升,速度递减
        .to({y: endY}, 300, egret.Ease.sineIn);  // 下降,速度递增  

    world.addChild(item);
    return item;
  }
}