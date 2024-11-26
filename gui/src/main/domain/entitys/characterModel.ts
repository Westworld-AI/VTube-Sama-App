import 'reflect-metadata'; // 最顶部添加这行
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../framework/orm/baseEntity';

@Entity({
  name: 'character_model'
})
export class CharacterModel extends BaseEntity {


  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '模型名称'
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '模型类型：internal、custom'
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '模型类型：live2d、vrm'
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
    comment: '头像路径'
  })
  icon_path: string;

  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
    comment: '模型文件路径'
  })
  model_path: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '闲置动画'
  })
  idles: any;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '嘴唇同步参数'
  })
  lip_sync_id: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '表情映射'
  })
  expression_mapping: any;

  @Column({
    type: 'json',
    nullable: true,
    comment: '动作映射'
  })
  action_mapping: any;

}
