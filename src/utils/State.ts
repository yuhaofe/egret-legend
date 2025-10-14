abstract class State {
    protected owner: any;
    protected stateName: string;
    
    constructor(owner: any, stateName: string) {
        this.owner = owner;
        this.stateName = stateName;
    }
    
    // 生命周期方法
    public enter(): void {}
    public exit(): void {}
    public update(deltaTime: number): void {}
    
    public getName(): string {
        return this.stateName;
    }
}