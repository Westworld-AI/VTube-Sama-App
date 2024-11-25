import React from 'react';
import { Card, Flex, Tag } from 'antd';
import { characterDefaultImageSrc } from '../../../constants/GlobalConstants';
import {Image} from "@nextui-org/react";


const imgStyle: React.CSSProperties = {
  display: 'block',
  width: '50%',
  height: '50%'
};

interface CharacterModelProps {
  id: Number;
  name: string;
  type: string;
  icon_path: string;
}

interface CharacterCardMenuProps {
  prefix: string;
  characterModelDTO: CharacterModelProps;
  onClick: (event) => void;
}

const CharacterCard: React.FC<CharacterCardMenuProps> = ({ prefix, characterModelDTO, onClick }) => {
  return (
    <Card key={prefix + characterModelDTO.id} hoverable
          styles={{
            body: {
              padding: 0,
              overflow: 'hidden',
              display: 'flex', // 确保用Flex布局
              flexDirection: 'row',  // 子项横向排列
              maxHeight: '120px',
              minHeight: '120px'
            }
          }}
          onClick={onClick}
    >
      <Flex justify='space-between'>
        <img
          alt='avatar'
          src={characterModelDTO.icon_path ? characterModelDTO.icon_path : characterDefaultImageSrc}
          style={{ ...imgStyle, height: '100%', objectFit: 'cover' }}
        />
        <Flex vertical align='flex-end' justify='space-between' style={{ padding: 10, alignItems: 'center' }}>
          <div className='model-name'>{characterModelDTO.name}</div>
          <Tag color='magenta' className='download-button'>{characterModelDTO.type}</Tag>
        </Flex>
      </Flex>
    </Card>
  );
};

export default CharacterCard;
