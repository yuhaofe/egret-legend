class MapLoader {
  private static _instance: MapLoader;

  constructor() {}

  public static get Instance(): MapLoader {
    if (!this._instance) {
      this._instance = new MapLoader();
    }
    return this._instance;
  }

  public async load(col: number, row: number, map: Map) {
    let key = `${col}_${row}`;
    
    // 计算一维索引
    let tileIndex = this.coordToIndex(col, row, map);
    
    // 创建瓦片
    let tile = new egret.Bitmap();
    tile.touchEnabled = true;
    tile.x = col * Map.MAP_TILE_WIDTH;
    tile.y = row * Map.MAP_TILE_HEIGHT;
    
    // 加载瓦片纹理(使用一维索引)
    RES.getResByUrl(`resource/assets/map/${map.mapName}/tiles/${tileIndex+1}.jpg`, (texture: egret.Texture) => {
        if (texture) {
            tile.texture = texture;
        } else {
            // 如果资源不存在,使用默认纹理或生成临时纹理
            this.createPlaceholderTexture(tile, col, row);
        }
    }, this);
    
    map.addChild(tile);
    map.setTile(key, tile);
  }

  // 将二维坐标转换为一维索引
  private coordToIndex(col: number, row: number, map: Map): number {
      return row * map.tilesCol + col;
  }
  
  // 将一维索引转换为二维坐标
  private indexToCoord(index: number, map: Map): {col: number, row: number} {
      return {
          col: index % map.tilesCol,
          row: Math.floor(index / map.tilesCol)
      };
  }

  // 创建占位纹理(用于演示)
  private createPlaceholderTexture(tile: egret.Bitmap, col: number, row: number): void {
      let shape = new egret.Shape();
      shape.graphics.beginFill(this.getRandomColor(col, row));
      shape.graphics.drawRect(0, 0, Map.MAP_TILE_WIDTH, Map.MAP_TILE_HEIGHT);
      shape.graphics.endFill();
      
      // 绘制边框
      shape.graphics.lineStyle(2, 0x000000);
      shape.graphics.drawRect(0, 0, Map.MAP_TILE_WIDTH, Map.MAP_TILE_HEIGHT);
      
      // 转换为纹理
      let renderTexture = new egret.RenderTexture();
      renderTexture.drawToTexture(shape);
      tile.texture = renderTexture;
  }
    
  // 获取随机颜色(基于坐标,保证相同位置颜色一致)
  private getRandomColor(col: number, row: number): number {
      let seed = col * 1000 + row;
      let colors = [0x88CC88, 0x77BB77, 0x99DD99, 0x66AA66];
      return colors[seed % colors.length];
  }
    
  // 卸载瓦片
  public unloadTile(key: string, map: Map): void {
      let tile = map.getTile(key);
      if (tile && tile.parent) {
          map.removeChild(tile);
          // 释放纹理资源
          if (tile.texture) {
            tile.texture = new egret.Texture();
          }
          map.deleteTile(key);
      }
  }
}