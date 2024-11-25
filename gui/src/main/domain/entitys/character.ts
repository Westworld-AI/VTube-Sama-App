import 'reflect-metadata'; // 最顶部添加这行
import {Entity, Column} from 'typeorm';
import {BaseEntity} from "../../framework/orm/baseEntity";

@Entity({
  name: "character"
})
export class Character extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '角色名称'
  })
  name: string | undefined;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '角色描述'
  })
  describe: string | undefined;

  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
    comment: '角色头像'
  })
  avatar: string | undefined;

  @Column({
    type: 'json',
    nullable: false,
    comment: '基础配置',
    default: () => "'{}'"
  })
  basic_setting: any;

  @Column({
    type: 'json',
    nullable: false,
    comment: '角色设定',
    default: () => "'{}'"
  })
  definition_setting: any;

  @Column({
    type: 'json',
    nullable: false,
    comment: '语音设定',
    default: () => "'{}'"
  })
  voice_setting: any;

  @Column({
    type: 'json',
    nullable: false,
    comment: '直播配置',
    default: () => "'{}'"
  })
  live_setting: any;

}
