enum Direction {
  Up = 0,
  UpRight = 1,
  Right = 2,
  DownRight = 3,
  Down = 4,
  DownLeft = 5,
  Left = 6,
  UpLeft = 7
}

namespace Direction {
  // 定义点的接口
  interface Point {
    x: number;
    y: number;
  }

  // 定义矩形的接口
  interface Rectangle {
    x: number;      // 左上角x坐标
    y: number;      // 左上角y坐标
    width: number;  // 宽度
    height: number; // 高度
  }

  export class Utils {
    constructor() {

    }

    /**
     * 获取矩形上距离点B最近的点
     */
    private static getClosestPointOnRectangle(rect: Rectangle, point: Point): Point {
      // 计算矩形的边界
      const left = rect.x;
      const right = rect.x + rect.width;
      const top = rect.y;
      const bottom = rect.y + rect.height;
      
      // 将点B限制在矩形范围内，得到最近点
      const closestX = Math.max(left, Math.min(point.x, right));
      const closestY = Math.max(top, Math.min(point.y, bottom));
      
      return { x: closestX, y: closestY };
    }

    /**
     * 判断点是否在矩形内部
     */
    public static isPointInsideRectangle(rect: Rectangle, point: Point): boolean {
      return point.x >= rect.x && 
            point.x <= rect.x + rect.width &&
            point.y >= rect.y && 
            point.y <= rect.y + rect.height;
    }

    /**
     * 计算从点A朝向点B的方向（8方向）
     */
    public static getDirectionFromPoint(a: Point, b: Point): Direction {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      
      if (dx === 0 && dy === 0) {
        return Direction.Up;
      }
      
      let angle = Math.atan2(dy, dx);
      let degrees = angle * (180 / Math.PI);
      degrees = degrees + 90;
      
      if (degrees < 0) {
        degrees += 360;
      }
      
      const directionIndex = Math.round(degrees / 45) % 8;
      return directionIndex as Direction;
    }

    /**
     * 计算从矩形A朝向点B的方向（8方向）
     * @param rectA 矩形A
     * @param pointB 目标点B
     * @returns 方向枚举值 (0-7)
     */
    public static getDirectionFromRectangle(rectA: Rectangle, pointB: Point): Direction {
      // 如果点B在矩形内部，可以选择返回特定值或使用矩形中心
      if (this.isPointInsideRectangle(rectA, pointB)) {
        // 返回一个默认方向或者可以抛出异常
        // console.warn('点B在矩形内部，使用矩形中心计算方向');
        const centerA = {
          x: rectA.x + rectA.width / 2,
          y: rectA.y + rectA.height / 2
        };
        return this.getDirectionFromPoint(centerA, pointB);
      }
      
      // 获取矩形上距离点B最近的点
      const closestPoint = this.getClosestPointOnRectangle(rectA, pointB);
      
      // 计算从最近点朝向B点的方向
      return this.getDirectionFromPoint(closestPoint, pointB);
    }

    /**
     * 将中心点坐标的 rect 转换为左上角坐标的 rect
     * @param rect 中心点坐标的矩形
     * @returns 左上角坐标的矩形
     */
    public static centerToTopLeft(rect: Rectangle): Rectangle {
      return {
        x: rect.x - rect.width / 2,
        y: rect.y - rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
  }
}

