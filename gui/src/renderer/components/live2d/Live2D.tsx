import React, {useEffect, useRef, useState} from 'react';
import {Application} from '@pixi/app';
import {Live2DModel, SoundManager} from 'pixi-live2d-display';
import {Ticker, TickerPlugin} from '@pixi/ticker';
import {InteractionManager} from '@pixi/interaction';
import {Renderer, ShaderSystem} from '@pixi/core';
import {install} from '@pixi/unsafe-eval';
import {Live2dCharacterModel} from '../../features/charactermodel/live2d/live2dModelLoader';
import {CharacterModelDTO} from '../../../main/domain/dto/characterModelDTO';

install({ShaderSystem});


interface Live2DComponentProps {
  characterModel: CharacterModelDTO;
  modelPath: string;
  width: number;
  height: number;
  audioElement: HTMLAudioElement | null;
  callbackLive2dCharacterModel?: (live2dCharacterModel: Live2dCharacterModel) => void;
  enabledIdle: boolean;
  enabledPositionAndSizeControl: boolean;
}

const Live2DComponent: React.FC<Live2DComponentProps> = ({
                                                           characterModel,
                                                           modelPath,
                                                           width,
                                                           height,
                                                           audioElement,
                                                           callbackLive2dCharacterModel,
                                                           enabledIdle,
                                                           enabledPositionAndSizeControl
                                                         }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const modelRef = useRef<Live2dCharacterModel>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 新增状态控制拖拽
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({x: 0, y: 0});

  if (enabledPositionAndSizeControl) {
    // 鼠标拖动控制模型位置
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        if (!modelRef.current || !modelRef.current.model) return;
        setIsDragging(true);
        setStartPos({x: e.clientX, y: e.clientY});
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!modelRef.current || !modelRef.current.model || !isDragging) return;
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        modelRef.current.model.position.x += dx;
        modelRef.current.model.position.y += dy;
        setStartPos({x: e.clientX, y: e.clientY});
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, startPos]);

    // 控制滑轮模型大小
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (!modelRef.current || !modelRef.current.model) return;
        const scaleSpeed = 0.005; // 缩放速度
        const delta = Math.sign(e.deltaY) * scaleSpeed;
        // 调整模型大小
        const currentScale = modelRef.current.model.scale.x;
        const newScale = Math.max(0.1, Math.min(3, currentScale - delta));
        modelRef.current.model.scale.set(newScale);
      };

      window.addEventListener('wheel', handleWheel);

      return () => window.removeEventListener('wheel', handleWheel);
    }, []);
  }

  useEffect(() => {
    // Register PIXI plugins
    Live2DModel.registerTicker(Ticker);
    Application.registerPlugin(TickerPlugin);
    Renderer.registerPlugin('interaction', InteractionManager);
    SoundManager.volume = 0.5;

    const container = document.querySelector('.right-panel') as HTMLElement || window as unknown as HTMLElement;
    appRef.current = new Application({
      view: canvasRef.current,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      resizeTo: container,
      backgroundAlpha: 0
    });

    const resize = () => {
      if (appRef.current && container) {
        // Use the container's width and height, or fallback to window's width and height
        const newWidth = container.clientWidth || window.innerWidth;
        const newHeight = container.clientHeight || window.innerHeight;
        // Resize the application
        appRef.current.renderer.resize(newWidth, newHeight);
        // Resize the Live2D model
        if (modelRef.current) {
          const live2dModel = modelRef.current.model;
          if (live2dModel) {
            // Calculate new scale and position for the model
            const scale = Math.min(newWidth / live2dModel.internalModel.width, newHeight / live2dModel.internalModel.height);
            live2dModel.scale.set(scale);
            live2dModel.position.set(newWidth / 2, newHeight / 2);
          }
        }
      }
    };
    window.addEventListener('resize', resize);
    return () => {
      if (appRef.current) {
        // Clean up resources
        appRef.current.destroy(true);
        appRef.current = null;
      }
      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  const setupAudioAnalyser = (audio: HTMLAudioElement) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 128; // 提高fftSize获取更细腻的频率数据
    audioAnalyserRef.current = analyser;
  };

  const animateModelWithAudio = () => {
    const analyser = audioAnalyserRef.current;
    const model = modelRef.current;
    if (analyser && model) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const lowerHalfArray = dataArray.slice(0, dataArray.length / 2);
      const overallAvg = lowerHalfArray.reduce((acc, val) => acc + val) / dataArray.length;

      // 动态基线校正，一般设置为检测期间的最低水平
      const baseline = 10; // 噪声基线，可能需要通过实际情况进行校准

      // 非一致性缩放
      const lowerBound = 40; // 低音量上限值，需要根据实际情况调整
      const upperBound = 200; // 高音量下限值，需要根据实际情况调整
      let lipSyncValue;
      if (overallAvg < baseline) {
        lipSyncValue = 0; // 太静，不生成嘴型动画
      } else if (overallAvg >= baseline && overallAvg < lowerBound) {
        lipSyncValue = 0.3 + ((overallAvg - baseline) / (lowerBound - baseline) * 0.3); // 平缓上升
      } else if (overallAvg >= lowerBound && overallAvg < upperBound) {
        lipSyncValue = 0.6 + ((overallAvg - lowerBound) / (upperBound - lowerBound) * 0.3); // 中等上升
      } else {
        lipSyncValue = 0.9 + ((overallAvg - upperBound) / (255 - upperBound) * 0.1); // 最大上限，尽量制避免总是完全开口
      }

      // 限制lipSyncValue在[0, 1]范围内
      lipSyncValue = Math.min(Math.max(lipSyncValue, 0), 1);

      model.speak(lipSyncValue); // 根据实际Live2D API调整方法名
    }
    animationFrameRef.current = requestAnimationFrame(animateModelWithAudio);
  };

  // 监听模型路径的变化，以及组件的卸载
  useEffect(() => {
    if (!appRef.current) return;
    const live2dCharacterModel = new Live2dCharacterModel(characterModel, modelPath, width, height, appRef.current, enabledIdle);
    modelRef.current = live2dCharacterModel;
    live2dCharacterModel.init().then(model => {
      if (callbackLive2dCharacterModel) {
        callbackLive2dCharacterModel(live2dCharacterModel);
      }
    });
    return () => {
      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }
    };
  }, [modelPath, appRef.current]);

  // 监听audioElement的变化，以及组件的卸载
  useEffect(() => {
    if (!audioElement) return;
    setupAudioAnalyser(audioElement);
    if (!animationFrameRef.current) {
      animateModelWithAudio();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioAnalyserRef.current) {
        const audioCtx = audioAnalyserRef.current.context;
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close();
        }
        audioAnalyserRef.current = null;
      }
    };
  }, [audioElement]);

  return <div>
    <canvas width={width} height={height} ref={canvasRef} />
  </div>;
};

export default Live2DComponent;
