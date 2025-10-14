enum EnemyType {
  SKULL = "SKULL"
}

class EnemyFactory {
  public static createEnemy(world: GameWorld, type: EnemyType, x: number, y: number): Enemy {
    switch (type) {
      case EnemyType.SKULL:
        let enemy = new Enemy();
        enemy.x = x;
        enemy.y = y;
        enemy.zIndex = Math.floor(enemy.y);
        world.addChild(enemy);
        return enemy;
      default:
        throw new Error("未知的怪物类型");
    }
  }

  public static createEnemies(world: GameWorld, count: number, map: Map): Enemy[] {
    const enemies: Enemy[] = [];
    
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      do {
        x = Math.floor(Math.random() * map.mapWidth);
        y = Math.floor(Math.random() * map.mapHeight);
      } while(!map.isBlockWalkable(x, y));
      const enemy = this.createEnemy(world, EnemyType.SKULL, x, y);
      enemies.push(enemy);
    }
    
    return enemies;
  }
}
