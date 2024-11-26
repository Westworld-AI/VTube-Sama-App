// AudioPlayerQueue.tsx
import React, { useEffect, useRef, useState } from 'react';
import voiceHandle from '../../features/voice/voiceHandle';
import { AudioFile } from '../../Types';

interface AudioPlayerQueueProps {
  queue: AudioFile[];
  onEnd: () => void;
  onAudioLoad: (audioElement: HTMLAudioElement, audioFile: AudioFile) => void;
}

const AudioPlayerQueue: React.FC<AudioPlayerQueueProps> = ({ queue, onEnd, onAudioLoad }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlay, setAudioPlay] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    let audioFile: AudioFile | null = null;
    if (audio && queue.length > 0 && !audioPlay) {
      audioFile = queue[0];
      audio.src = audioFile.url;
      setAudioPlay(true);
      audio.play().catch((error) => {
        voiceHandle.deleteVoiceFile(audio.src);
        console.error('Audio playback failed:', error);
        setAudioPlay(false);
        onEnd();
      });
    }
    // 设置audio元素的loadeddata事件回调，当音频加载完成后触发
    const handleLoadedData = () => {
      if (audio && audioFile) {
        onAudioLoad(audio, audioFile);
      }
    };
    if (audio) {
      audio.addEventListener('loadeddata', handleLoadedData);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('loadeddata', handleLoadedData);
      }
    };
  }, [queue]); // 当队列改变时重新执行此effect

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnd = () => {
      setAudioPlay(false);
      onEnd();
      if (audioRef.current) {
        voiceHandle.deleteVoiceFile(audioRef.current.src);
      }
    };
    if (audio) {
      audio.addEventListener('ended', handleEnd);
      // 清除ended事件监听器
      return () => audio.removeEventListener('ended', handleEnd);
    }
  }, [queue, onEnd]); // 使用queue和onEnd作为依赖

  return <audio hidden ref={audioRef} />;
};

export default AudioPlayerQueue;
