import {useEffect, useState} from 'react';
import {Breadcrumb, Button, Card, Col, Empty, Form, FormProps, Input, Modal, Result, Row} from "antd";
import {SettingOutlined, EditOutlined, SearchOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import characterHandle from "../../features/character/characterHandle";
import {CharacterDTO} from "../../../main/domain/dto/characterDTO";
import DeleteCharacter from "../character/DeleteCharacter";

type CreateCharacter = {
  name?: string;
  describe?: string;
};

const VoiceModel = () => {

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
      })
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

  const onCreateCharacter: FormProps<CreateCharacter>["onFinish"] = (values) => {
    setLoading(true);
    try {
      const newEntity = characterHandle.create(values)
      newEntity.then((result: CharacterDTO) => {
        setLoading(false);
        setOpen(false);
        onRefreshCharacter()
        navigate(`/edit-character-space?id=${result.id}`);
        console.log('Entity created:', result);
      })
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="正在施工中，敬请期待"
    />
  )
};

export default VoiceModel;
