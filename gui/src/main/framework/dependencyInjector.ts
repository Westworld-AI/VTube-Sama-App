// 提供了一个用于依赖注入的简单容器
type Constructor<T> = { new (...args: any[]): T };
type DependencyContainer = Map<Constructor<any>, any>;

class DependencyInjector {
  private dependencies: DependencyContainer = new Map();

  public register<T>(constructor: Constructor<T>, implementation: T): void {
    this.dependencies.set(constructor, implementation);
  }

  public resolve<T>(constructor: Constructor<T>): T {
    const dependency = this.dependencies.get(constructor);
    if (!dependency) {
      throw new Error(`Dependency not found: ${constructor.name}`);
    }
    return dependency;
  }
}

export const injector = new DependencyInjector();
