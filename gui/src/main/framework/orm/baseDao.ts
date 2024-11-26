import { Repository, Connection, FindManyOptions, DeepPartial } from 'typeorm';

export class BaseDao<T> {
  protected repository: Repository<T>;

  constructor(connection: Connection, entity: new () => T) {
    this.repository = connection.getRepository(entity);
  }

  // 创建实体
  async create(entityData: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(entityData);
    return this.repository.save(entity);
  }

  // 获取所有实体
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  // 根据ID获取实体
  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: {
        id: id
      }
    });
  }

  // 更新实体信息
  async update(id: number, entityData: DeepPartial<T>): Promise<void> {
    await this.repository.update(id, entityData);
  }

  // 删除实体
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
