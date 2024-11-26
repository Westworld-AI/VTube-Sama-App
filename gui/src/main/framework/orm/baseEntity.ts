import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({type: 'datetime', nullable: false})
  createTime: Date;

  @UpdateDateColumn({type: 'datetime', nullable: false})
  updateTime: Date;

  @BeforeInsert()
  setCreateTime(): void {
    this.createTime = new Date();
  }

  @BeforeUpdate()
  setUpdateTime(): void {
    this.updateTime = new Date();
  }
}
