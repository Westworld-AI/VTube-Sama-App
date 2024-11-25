import React, { useEffect } from 'react';
import { Card, Form, Input, Select } from 'antd';
import { CharacterFormDTO } from '../../../main/domain/dto/characterDTO';
import { BackgroundOption } from '../../constants/OptionConstants';
import { LLMSettingDTO } from '../../../main/domain/dto/systemSettingDTO';

const homeLiveSettingDiv = {
  width: '300px',
  marginRight: '30px'
};

interface HomeOtherSetting {
  currentBackground: string;
  backgroundOption: BackgroundOption[];
  setBackground: (backgroundSrc: string) => void;
}

const HomeOtherSetting: React.FC<HomeOtherSetting> = ({ backgroundOption, setBackground, currentBackground }) => {

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldValue('background', currentBackground);
  }, []);

  const onBackgroundChange = (value: string) => {
    setBackground(value);
  };


  return (
    <div>
      <Form
        name='basic'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        autoComplete='off'
        form={form}
      >
        <Card title='其他设置' className='bg-white bg-opacity-90'>
          <Form.Item<CharacterFormDTO>
            label='id'
            name='id'
            hidden={true}
          >
            <Input />
          </Form.Item>
          <Form.Item<CharacterFormDTO>
            label='背景图片'
            name='background'
          >
            <Select onChange={onBackgroundChange}>
              {backgroundOption.map((item) => (
                <Select.Option value={item.src}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default HomeOtherSetting;
