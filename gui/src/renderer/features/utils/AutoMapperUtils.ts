import 'reflect-metadata';

class AutoMapper {
  // 泛型方法map，用于将一个对象映射为另一个类型的实例
  static map<T, V>(source: T, targetClass: { new(): V }): V {
    const targetInstance = new targetClass();
    Object.keys(targetInstance).forEach(key => {
      const metadataValue = Reflect.getMetadata(key, targetInstance);
      if (metadataValue) {
        // 如果DTO中的字段通过Reflect定义了特殊元数据，可以在此处添加处理逻辑
      }
      // 使用Object.prototype.hasOwnProperty.call确保适用于所有对象
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        targetInstance[key] = source[key];
      }
    });
    return targetInstance;
  }

  static mapArray<T, V>(sourceArray: T[], targetClass: { new(): V }): V[] {
    return sourceArray.map(source => this.map(source, targetClass));
  }
}

export { AutoMapper };
