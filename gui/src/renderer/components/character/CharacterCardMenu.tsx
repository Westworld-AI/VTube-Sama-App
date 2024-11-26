import {CaretLeftOutlined, CaretRightOutlined} from '@ant-design/icons';
import {useEffect, useRef, useState} from 'react';
import {CharacterDTO} from '../../../main/domain/dto/characterDTO';
import characterHandle from '../../features/character/characterHandle';
import {Card, CardFooter, Image, Button} from "@nextui-org/react";


interface CharacterCardMenuProps {
  onSetCharacterDTO: (characterDTO: CharacterDTO) => void;
}

const CharacterCardMenu: React.FC<CharacterCardMenuProps> = ({onSetCharacterDTO}) => {

  const scrollRef = useRef(null);
  const [cards, setCards] = useState<CharacterDTO[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const cardMargin = 30; // 这是.card的左右margin之和

  useEffect(() => {
    loadCharacters();
  }, []); //

  const loadCharacters = async () => {
    try {
      characterHandle.findAll().then((result: CharacterDTO[]) => {
        // 过滤配置不完整的模型
        const filteredResult = result.filter(item => Object.keys(item.basic_setting).length > 0);
        setCards(filteredResult);
      });
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const onCardClick = (characterDTO: CharacterDTO) => {
    onSetCharacterDTO(characterDTO);
  };

  const scrollTo = (direction) => {
    if (scrollRef.current) {
      const {current: container} = scrollRef;
      let newScrollPosition = scrollPosition;

      const cardWidthWithMargin = container.firstChild.offsetWidth + cardMargin; // First child的宽度加上margin

      if (direction === 'left') {
        newScrollPosition = Math.max(0, scrollPosition - cardWidthWithMargin * 4);
      } else {
        newScrollPosition = Math.min(
          scrollPosition + cardWidthWithMargin * 4,
          container.scrollWidth - container.clientWidth
        );
      }

      container.scrollTo({
        top: 0,
        left: newScrollPosition,
        behavior: 'smooth' // 平滑滚动效果
      });

      setScrollPosition(newScrollPosition);
    }
  };

  return <div className='absolute w-3/5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center'
              style={{
                bottom: '30px'
              }}>
    <Button isIconOnly
            color="primary"
            style={{height: 120, marginLeft: 10}}
            aria-label="Like"
            onClick={() => scrollTo('left')}>
      <CaretLeftOutlined/>
    </Button>
    <div className='overflow-hidden whitespace-nowrap w-full' ref={scrollRef}>
      {cards.map((card, index) => (
        <Card
          key={'vcm_' + card.id}
          isFooterBlurred
          radius="lg"
          className="inline-block mx-[7.5px] w-[calc(25%-15px)] sm:w-1/4 overflow-hidden"
        >
          <Image
            isZoomed
            className="h-full w-full object-cover border-2" // 添加悬浮时边框
            alt={card.name}
            src={card.avatar}
            onClick={() => onCardClick(card)}
            style={{aspectRatio: '1 / 1'}} // 添加aspectRatio确保宽高一致

          />
          <CardFooter
            className="border-1 h-4 flex items-center justify-center bg-white/60  overflow-hidden py-1 absolute rounded-large bottom-2 w-[calc(100%_-_15px)] shadow-small ml-2 z-10"
          >
            <p className="text-tiny font-bold text-black">{card.name}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
    <Button isIconOnly
            color="primary"
            style={{height: 120, marginLeft: 10}}
            aria-label="Like"
            onClick={() => scrollTo('right')}>
      <CaretRightOutlined/>
    </Button>
  </div>;
};

export default CharacterCardMenu;

