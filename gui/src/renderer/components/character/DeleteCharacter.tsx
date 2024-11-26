import {DeleteOutlined} from "@ant-design/icons";
import {Button, Modal} from "antd";
import {useState} from "react";
import characterHandle from "../../features/character/characterHandle";

interface DeleteCharacterProps {
  characterId: number;
  characterName: string;
  onRefreshCharacter: () => void;
}

const DeleteCharacter: React.FC<DeleteCharacterProps> = ({characterId, characterName, onRefreshCharacter}) => {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDelete = () => {
    characterHandle.delete(characterId).then(() => {
        setLoading(false)
        setOpen(false)
        onRefreshCharacter()
      }
    ).catch((error) => {
      setOpen(false)
      setLoading(false); // 确保即使请求失败也会停止加载状态
    });
  }

  const onOpen = () => {
    setOpen(true)
  }

  const onClose = () => {
    setLoading(false)
    setOpen(false)
  }


  return <>
    <DeleteOutlined key="delete" onClick={onOpen}/>
    <Modal
      open={open}
      title="删除主播"
      onCancel={onClose}
      footer={[
        <Button key="yes" type="primary" loading={loading} onClick={onDelete}>
          是
        </Button>,
        <Button key="no" loading={loading} onClick={onClose}>
          否
        </Button>,
      ]}
    >
      <p>请确定是否要删除 <strong>{characterName}</strong>？</p>
    </Modal>
  </>
}

export default DeleteCharacter;
