import 'reflect-metadata'; // 最顶部添加这行
import {Entity, Column} from 'typeorm';
import {BaseEntity} from "../../framework/orm/baseEntity";

@Entity({
  name: "system_setting"
})
export class SystemSetting extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    default: "zh_Hans",
    comment: '语言：en、zh_Hans'
  })
  language: string;

  @Column({
    type: 'json',
    nullable: false,
    comment: 'home系统配置',
    default: () => "'{}'"
  })
  home_setting: any;

  @Column({
    type: 'json',
    nullable: false,
    comment: '语言模型配置',
    default: () => "'{}'"
  })
  llm_setting: any;

  @Column({
    type: 'json',
    nullable: false,
    comment: '直播配置',
    default: () => "'{}'"
  })
  live_setting: any;

}
