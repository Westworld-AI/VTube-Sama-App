import 'reflect-metadata'; // 最顶部添加这行
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import {BaseEntity} from "../../framework/orm/baseEntity";

@Entity({
  name: "character_chat_history"
})
export class CharacterChatHistory extends BaseEntity {

  @Column({
    type: 'int',
    nullable: true,
    comment: '角色ID'
  })
  character_id: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '来源：client、b站、抖音'
  })
  source: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '发送者'
  })
  sender: string;

  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
    comment: '问题'
  })
  question: string;

  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
    comment: '答案'
  })
  answer: string;

}
