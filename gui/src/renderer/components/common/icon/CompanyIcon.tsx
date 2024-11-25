import React from 'react';
import { SiBilibili } from 'react-icons/si';
import { FaTiktok } from 'react-icons/fa';

interface CompanyIconProps {
  name: string;
  size: number;
}

const CompanyIcon: React.FC<CompanyIconProps> = (
  {
    name,
    size
  }) => {
    if (!name) return;
    // currently supported models, maybe not in its own provider
    if (name.startsWith('blibili')) return <SiBilibili size={size} />;
    if (name.startsWith('douyin') || name.startsWith('tiktok ')) return <FaTiktok size={size} />;
    return <></>;
  }
;

export default CompanyIcon;
