import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Button, Upload, message, Drawer, Space, Tooltip, Popconfirm, PopconfirmProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import characterModelHandle from '../../features/charactermodel/CharacterModelHandle';
import { CharacterModelDTO } from '../../../main/domain/dto/characterModelDTO';
import EditCharacterModel from './EditCharacterModel';
import CharacterCard from '../common/card/CharacterCard';


const CharacterModel: React.FC = () => {

  const [customCharacterModels, setCustomCharacterModels] = useState<CharacterModelDTO[]>([]);
  const [customCharacterModelMap, setCustomCharacterModelMap] = useState<Map<string, CharacterModelDTO>>(new Map<string, CharacterModelDTO>());
  const [internalCharacterModels, setInternalCharacterModels] = useState<CharacterModelDTO[]>([]);
  const [internalCharacterModelMap, setInternalCharacterModelMap] = useState<Map<string, CharacterModelDTO>>(new Map<string, CharacterModelDTO>());
  const [openEditCharacterModel, setOpenEditCharacterModel] = React.useState<boolean>(false);
  const [currenCharacterModel, setCurrenCharacterModel] = React.useState<CharacterModelDTO | null>(null);
  const editCharacterModelFormRef = useRef();
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    console.log('loadCharacterModels');
    loadCharacterModels();
  }, []); //

  useEffect(() => {
    if (currenCharacterModel !== null) {
      setOpenEditCharacterModel(true);
    }
  }, [currenCharacterModel]);

  const loadCharacterModels = () => {
    try {
      characterModelHandle.findByCustom().then(res => {
        setCustomCharacterModels(res);
        const characterModelMap = new Map<string, CharacterModelDTO>();
        res.forEach(item => {
          characterModelMap.set('custom_cm_' + item.id, item);
        });
        setCustomCharacterModelMap(characterModelMap);
      });
      characterModelHandle.findByInternal().then(res => {
        setInternalCharacterModels(res);
        const characterModelMap = new Map<string, CharacterModelDTO>();
        res.forEach(item => {
          characterModelMap.set('internal_cm_' + item.id, item);
        });
        setInternalCharacterModelMap(characterModelMap);
      });
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const handleUpload = (file: File) => {
    characterModelHandle.upload(file.path).then((isError) => {
      if (!isError) {
        message.success('导入成功', 1);
      } else {
        message.error('导入失败', 1);
      }
      loadCharacterModels();
    });
  };

  const showEditCharacterModel = (event, type: string, key: string) => {
    if (type === 'internal') {
      // @ts-ignore
      setCurrenCharacterModel(internalCharacterModelMap.get(key));
    } else if (type === 'custom') {
      // @ts-ignore
      setCurrenCharacterModel(customCharacterModelMap.get(key));
    }
  };

  const confirm: PopconfirmProps['onConfirm'] = (e) => {
    setEditLoading(true);
    if (currenCharacterModel && currenCharacterModel.id) {
      characterModelHandle.delete(currenCharacterModel.id).then(() => {
        message.success('删除成功', 1);
        setEditLoading(false);
        setOpenEditCharacterModel(false);
        loadCharacterModels();
      });
    } else {
      message.error('人物模型不存在', 1);
      setEditLoading(false);
      setOpenEditCharacterModel(false);
      loadCharacterModels();
    }
  };
  return (
    <div className='dashboard'
         style={{ height: 'calc(100vh - 90px)', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '30px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Row align='middle'>
            <Col span={8}>
              <h3 className='text-xl font-bold'>用户模型</h3>
            </Col>
            <Col flex='auto' style={{ textAlign: 'right' }}>
              <Upload maxCount={1} showUploadList={false} customRequest={({ file, onSuccess, onError }) => {
                handleUpload(file as File);
                onSuccess?.('ok');
              }}>
                <Tooltip placement='topLeft' title='请选择Live2D模型压缩包，仅支持.zip格式'>
                  <Button type='primary' icon={<UploadOutlined />}>＋ 导入</Button>
                </Tooltip>
              </Upload>
            </Col>
          </Row>
        </Col>
        {customCharacterModels.length > 0 ? (
          customCharacterModels.map((item) => (
            <Col span={8} key={`custom_cm_${item.id}`}>
              <CharacterCard
                prefix='custom_cm_'
                characterModelDTO={item}
                onClick={(event) => {
                  showEditCharacterModel(event, 'custom', 'custom_cm_' + item.id);
                }}
              />
            </Col>
          ))
        ) : (
          // 当 customCharacterModels 为空时，显示一个空的占位元素占据一定的空间
          <Col span={8}>
            <div style={{ height: '150px' }}>  {/* 通过修改这里的高度来调整占位元素的大小 */}</div>
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} className='mt-8'>
        <Col span={24}>
          <h3 className='text-xl font-bold'>内置模型</h3>
        </Col>
        {internalCharacterModels.map((item) => (
          <Col span={8} key={`internal_cm_${item.id}_${new Date().getTime()}`}>
            <CharacterCard prefix='internal_cm_' characterModelDTO={item} onClick={(event) => {
              showEditCharacterModel(event, 'internal', 'internal_cm_' + item.id);
            }} />
          </Col>
        ))}
      </Row>
      <Drawer
        closable
        destroyOnClose
        title={<p>编辑人物模型</p>}
        width={720}
        placement='right'
        open={openEditCharacterModel}
        onClose={() => setOpenEditCharacterModel(false)}
        styles={{
          body: {
            overflow: 'hidden'
          }
        }}
        extra={
          <Space>
            {currenCharacterModel?.category === 'custom' && (
              <Popconfirm
                title='删除人物模型'
                description='是否删除人物模型?'
                onConfirm={confirm}
                okText='是'
                cancelText='否'
              ><Button type='primary' danger>Delete</Button>
              </Popconfirm>
            )}
            <Button type='primary' loading={editLoading} onClick={() => {
              setEditLoading(true);
              try {
                editCharacterModelFormRef.current.submitForm();
              } catch (e) {
                console.error(e);
              } finally {
                setEditLoading(false);
                setOpenEditCharacterModel(false);
              }
            }}>Save</Button>
          </Space>
        }
      >
        <EditCharacterModel ref={editCharacterModelFormRef} characterModel={currenCharacterModel}
                            onSubmitFormCall={() => {
                              console.log('onSubmitFormCall');
                              loadCharacterModels();
                            }} />
      </Drawer>
    </div>
  );
};

export default CharacterModel;
