import 'reflect-metadata'; // 最顶部添加这行
import {Entity, Column} from 'typeorm';
import {BaseEntity} from "../../framework/orm/baseEntity";

@Entity({
  name: "character_definition"
})
export class CharacterDefinition extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '角色名称'
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '角色基本信息定义'
  })
  persona: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '角色的性格简短描述'
  })
  personality: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: '角色的对话的情况和背景',
    default: ''
  })
  scenario: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: '对话范例',
    default: ''
  })
  examples_of_dialogue: string;

}
