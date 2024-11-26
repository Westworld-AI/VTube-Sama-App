interface BackgroundOption {
  name: string;
  src: string;
}

const builtInBackgroundOptions = [
  {
    name: '绿幕',
    src: 'greenScreen'
  },
  {
    name: 'School01',
    src: 'assets/background/School01.jpg'
  },
  {
    name: 'School02',
    src: 'assets/background/School02.jpg'
  },
  {
    name: 'Street01',
    src: 'assets/background/Street01.png'
  },
  {
    name: 'Street02',
    src: 'assets/background/Street02.jpg'
  },
  {
    name: 'Street03',
    src: 'assets/background/Street03.jpg'
  },
  {
    name: 'Street04',
    src: 'assets/background/Street04.jpg'
  },
  {
    name: 'Street05',
    src: 'assets/background/Street05.jpg'
  },
  {
    name: 'Room01',
    src: 'assets/background/Room01.jpg'
  },
  {
    name: 'Room02',
    src: 'assets/background/Room02.jpeg'
  },
  {
    name: 'Room03',
    src: 'assets/background/Room03.png'
  },
  {
    name: 'Room04',
    src: 'assets/background/Room04.png'
  }
];

interface LiveClientOption {
  id: string;
  name: string;
}

const liveClientOptions = [
  {
    id: 'bilibili',
    name: 'B站'
  },
  // {
  //   id: 'douyin',
  //   name: '抖音'
  // }
];

export { builtInBackgroundOptions, BackgroundOption, liveClientOptions, LiveClientOption };
