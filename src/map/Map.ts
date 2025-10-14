
class Map extends egret.DisplayObjectContainer {
  public static MAP_TILE_WIDTH = 512;
  public static MAP_TILE_HEIGHT = 256;
  public static MAP_GRID_WIDTH = 48;
  public static MAP_GRID_HEIGHT = 32;

  public blocks: Array<Array<boolean>> = [[]];
  private coverDic: {[key: number]: boolean} = {};
  private safeDic: {[key: number]: boolean} = {};

  public mapName: string;
  public tilesCol: number;
  public tilesRow: number;
  public blocksCol: number = 0;
  public blocksRow: number = 0;
  public blockOffsetX: number = 0;
  public blockOffsetY: number = 0;

  private tiles: {[key: string]: egret.Bitmap} = {};
  private visibleTiles: {[key: string]: boolean} = {};

  private viewportBuffer: number = 0; // 额外加载的瓦片缓冲区

  public mapWidth: number;
  public mapHeight: number;

  constructor(mapName: string) {
    super();

    this.mapName = mapName;
    this.mapWidth = 9728;
    this.mapHeight = 6400;
    this.tilesCol = Math.floor(this.mapWidth / Map.MAP_TILE_WIDTH);
    this.tilesRow = Math.floor(this.mapHeight / Map.MAP_TILE_HEIGHT);

    this.blocksCol = 200;
    this.blocksRow = 200;
    this.blockOffsetX = 0;
    this.blockOffsetY = 20;

    // this.loadData();
    this.loadMiniMap();
  }

  public async loadData() {
    const buffer: ArrayBuffer = await RES.getResByUrl(`resource/assets/map/${this.mapName}/map.dat`, undefined, undefined, RES.ResourceItem.TYPE_BIN);
    const dataArray = new egret.ByteArray(buffer); // ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
    dataArray.endian = egret.Endian.LITTLE_ENDIAN, // 设置小端
    dataArray.position = 0;
    const blockCount = dataArray.readInt(); // 前32字节是block数量

    // 定义位掩码常量
    const BLOCK_MASK = 8;      // 0b1000 - 判断是否可行走(阻挡)
    const COVER_MASK = 4;      // 0b0100 - 判断是否有遮挡
    const SAFE_MASK = 2;       // 0b0010 - 判断是否为安全区

    // 用于读取压缩数据的变量
    let currentByte = 0;           // 当前读取的字节
    let isHighNibble = true;       // 是否读取高4位(true=高4位, false=低4位)
    let currentNibble = 0;         // 当前的半字节(4位)数据
    let processedCount = 0;        // 已处理的块数量

    // 初始化二维数组存储地图块数据
    this.blocks = new Array(this.blocksRow);

    for (let row = 0; row < this.blocksRow; row++) {
      const colArray = new Array(this.blocksCol);
      for (let col = 0; col < this.blocksCol; col++) {
        if (isHighNibble) {
          currentByte = dataArray.readByte();
          
          // 处理负数(将有符号字节转为无符号)
          if (currentByte < 0) {
            currentByte += 256;
          }
          
          // 提取高4位
          currentNibble = currentByte >> 4;
          isHighNibble = false;
        } else {
          // 提取低4位
          currentNibble = currentByte & 15; // 15 = 0b1111
          isHighNibble = true;
        }
        
        // 生成块的唯一标识: (列 << 16) + 行
        const blockId = (col << 16) + row;
        
        if ((currentNibble & BLOCK_MASK) > 0) {
          colArray[col] = true; // 阻挡
        } else {
          colArray[col] = false; // 可行走
        }
        
        if ((currentNibble & COVER_MASK) > 0) {
          this.coverDic[blockId] = true; // 遮挡
        }
        
        if ((currentNibble & SAFE_MASK) > 0) {
          this.safeDic[blockId] = true; // 安全区
        }
        
        processedCount++;
      }
      
      this.blocks[row] = colArray;
    }

    console.log(this.blocks);
  }

  private async loadMiniMap() {
    const texture = await RES.getResByUrl(`resource/assets/map/${this.mapName}/minimap.jpg`)
    EventBus.Instance.emit("MINIMAP_LOADED", texture);
  }

  public isBlockWalkable(x:number, y:number) {
    let blockX = Math.floor((x + this.blockOffsetX) / Map.MAP_GRID_WIDTH);
    let blockY = Math.floor((y + this.blockOffsetY) / Map.MAP_GRID_HEIGHT);
    blockX = blockX >= this.blocksCol ? this.blocksCol - 1 : blockX;
    blockY = blockY >= this.blocksRow ? this.blocksRow - 1 : blockY;
    return !this.blocks[blockY][blockX];
  }

  public isNextBlockWalkable(x:number, y:number, direction: Direction) {
    const blockX = Math.floor((x + this.blockOffsetX) / Map.MAP_GRID_WIDTH);
    const blockY = Math.floor((y + this.blockOffsetY) / Map.MAP_GRID_HEIGHT);
    const moveDirection = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    const nextBlockX = blockX + moveDirection[direction][0];
    const nextBlockY = blockY + moveDirection[direction][1];
    if (nextBlockX < 0 ||
      nextBlockX > this.blocksCol - 1 || 
      nextBlockY < 0 ||
      nextBlockY > this.blocksRow - 1
    ) {
      return false;
    }
    return !this.blocks[nextBlockY][nextBlockX];
  }

  public isBlockCovered(x:number, y:number) {
    const blockX = Math.floor((x + this.blockOffsetX) / Map.MAP_GRID_WIDTH);
    const blockY = Math.floor((y + this.blockOffsetY) / Map.MAP_GRID_HEIGHT);
    const blockId = (blockX << 16) + blockY;
    return this.coverDic[blockId];    
  }

  // 根据相机位置更新可见瓦片
  public updateVisibleTiles(cameraX: number, cameraY: number, stageW: number, stageH: number): void {
    // 计算可见区域的瓦片范围
    let startCol = Math.floor(-cameraX / Map.MAP_TILE_WIDTH) - this.viewportBuffer;
    let endCol = Math.ceil((-cameraX + stageW) / Map.MAP_TILE_WIDTH) + this.viewportBuffer;
    let startRow = Math.floor(-cameraY / Map.MAP_TILE_HEIGHT) - this.viewportBuffer;
    let endRow = Math.ceil((-cameraY + stageH) / Map.MAP_TILE_HEIGHT) + this.viewportBuffer;
    
    // 限制在地图范围内
    startCol = Math.max(0, startCol);
    endCol = Math.min(this.tilesCol, endCol);
    startRow = Math.max(0, startRow);
    endRow = Math.min(this.tilesRow, endRow);
    
    let newVisibleTiles: {[key: string]: boolean} = {};
    
    // 加载可见区域的瓦片
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            let key = `${col}_${row}`;
            newVisibleTiles[key] = true;
            
            if (!this.tiles[key]) {
                MapLoader.Instance.load(col, row, this);
            }
        }
    }
    
    // 移除不可见的瓦片
    for (let key in this.visibleTiles) {
        if (!newVisibleTiles[key]) {
          MapLoader.Instance.unloadTile(key, this);
        }
    }
    
    this.visibleTiles = newVisibleTiles;
  }
  

  public getTile(key: string): egret.Bitmap {
    return this.tiles[key];
  }

  public setTile(key: string, tile: egret.Bitmap) {
    this.tiles[key] = tile;
  }

  public deleteTile(key: string) {
    delete this.tiles[key];
  }
}