import React from 'react';

interface BackgroundProps {
  imageSrc: string;
}

const Background: React.FC<BackgroundProps> = ({ imageSrc }) => {
  // 如果 imageSrc 等于 "greenScreen"，则展示一个纯绿色背景的div，否则，展示img标签
  const content = (imageSrc === 'greenScreen') ? (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      backgroundColor: '#00FF00' // 绿色背景
    }} />
  ) : (
    <img src={imageSrc} alt='' style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1
    }} />
  );

  return (
    <div>{content}</div>
  );
};

export default Background;
