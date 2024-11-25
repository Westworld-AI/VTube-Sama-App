// CharacterSpace.tsx

import {useEffect, useState} from 'react';
import {Col, Empty, Form, FormProps, Input, Modal, Row, Button} from 'antd';
import {Card, CardFooter, Image} from "@nextui-org/react";
import {SearchOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import characterHandle from '../features/character/characterHandle';
import {CharacterDTO} from '../../main/domain/dto/characterDTO';

type CreateCharacter = {
  name?: string;
  describe?: string;
};

const CharacterSpace = () => {
    const [cards, setCards] = useState<CharacterDTO[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm(); // Form 实例

    useEffect(() => {
      loadCharacters();
    }, []); //

    const loadCharacters = async () => {
      try {
        characterHandle.findAll().then((result: CharacterDTO[]) => {
          setCards(result);
        });
      } catch (error) {
        console.error('Failed to fetch characters:', error);
      }
    };

    const onRefreshCharacter = () => {
      loadCharacters(); //
    };

    const showAddCharacterModel = () => {
      setOpen(true);
    };

    const closeAddCharacterModel = () => {
      setOpen(false);
    };

    const onCreateCharacter: FormProps<CreateCharacter>['onFinish'] = (values) => {
      setLoading(true);
      try {
        const newEntity = characterHandle.create(values);
        newEntity.then((result: CharacterDTO) => {
          setLoading(false);
          setOpen(false);
          onRefreshCharacter();
          navigate(`/edit-character-space?id=${result.id}`);
          console.log('Entity created:', result);
        });
      } catch (error) {
        console.error('Error creating entity:', error);
      }
    };

    return (
      <div>
        <div className='space-add-button-container'>
          <Row align='middle'>
            <Col span={8}>
              <Input addonBefore={<SearchOutlined/>} style={{width: 275.25}} placeholder='搜索'/>
            </Col>
            <Col flex='auto' style={{textAlign: 'right'}}>
              <Button onClick={showAddCharacterModel} size='large' type='primary'>
                New
              </Button>
              <Modal
                open={open}
                title='创建角色'
                onCancel={closeAddCharacterModel}
                footer={[
                  <Button key='submit' type='primary' loading={loading} onClick={() => form.submit()}>
                    save
                  </Button>
                ]}
              >
                <Form
                  form={form}
                  name='basic'
                  labelAlign='right'
                  labelCol={{span: 6}}
                  wrapperCol={{span: 16}}
                  style={{maxWidth: 600}}
                  initialValues={{remember: true}}
                  onFinish={onCreateCharacter}
                  autoComplete='off'
                >
                  <Form.Item<CreateCharacter>
                    label='名称'
                    name='name'
                    rules={[{required: true, message: '请输入主播名称'}]}
                  >
                    <Input/>
                  </Form.Item>
                  <Form.Item<CreateCharacter>
                    label='描述'
                    name='describe'
                  >
                    <Input.TextArea/>
                  </Form.Item>
                </Form>
              </Modal>
            </Col>
          </Row>
        </div>
        <div className='space-card-container'>
          {cards.length === 0 ? (  // 条件渲染，检查数组长度
            <Empty description='No Characters'/>
          ) : (
            <Row gutter={[16, 16]}>
              {cards.map((card: CharacterDTO) => (
                <Col span={4} key={card.id}>
                  <Card
                    isFooterBlurred
                    radius="lg"
                    className="border-none min-h-[250px]"
                  >
                    <Image
                      isZoomed
                      alt={card.name}
                      src={card.avatar}
                      className="h-full w-full object-cover border-4" // 添加悬浮时边框
                      style={{aspectRatio: '9 / 16'}}
                      onClick={() => navigate(`/edit-character-space?id=${card.id}`)}
                    />
                    <CardFooter
                      className="border-1 h-8 flex items-center justify-center bg-white/80  overflow-hidden py-1 absolute rounded-large bottom-2 w-[calc(100%_-_15px)] shadow-small ml-2 z-10"
                    >
                      <p className="text-tiny font-bold text-black">{card.name}</p>
                    </CardFooter>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    )
      ;
  }
;

export default CharacterSpace;
