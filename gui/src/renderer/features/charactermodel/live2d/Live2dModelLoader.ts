import { Live2DModel, MotionPreloadStrategy, MotionPriority } from 'pixi-live2d-display';
import { Application } from '@pixi/app';
import { BaseCharacterModel } from '../characterModelLoader';
import { CharacterModelDTO } from '../../../../main/domain/dto/characterModelDTO';


export class Live2dCharacterModel extends BaseCharacterModel {
  private _model: Live2DModel | null = null;
  private modelPath: string;
  private width: number;
  private height: number;
  private lipSyncId: string;
  private application: Application;
  private idles: string[];
  private characterModel: CharacterModelDTO;
  private _lipSyncIds: string[] = [];
  private _definitions: string[] = [];
  private isActive: boolean = true;
  private timeoutRef: ReturnType<typeof setTimeout> | null = null; // 用于跟踪 setTimeout 的返回值
  private enabledIdle: boolean = true;


  constructor(characterModel: CharacterModelDTO, modelPath: string, width: number, height: number, application: Application, enabledIdle: boolean) {
    super();
    this.modelPath = modelPath;
    this.width = width;
    this.height = height;
    this.application = application;
    this.characterModel = characterModel;
    this.lipSyncId = characterModel.lip_sync_id ? characterModel.lip_sync_id : 'ParamMouthOpenY';
    this.idles = characterModel.idles ? characterModel.idles : [];
    this.enabledIdle = enabledIdle;
  }

  // 提供一个init方法来异步加载模型
  public async init(): Promise<Live2DModel> {
    try {
      console.debug('loaderLive2d modelPath:', this.modelPath);
      const model = await Live2DModel.from(this.modelPath, {
        motionPreload: MotionPreloadStrategy.IDLE,
        idleMotionGroup: 'main_idle',
        autoInteract: false
      });
      // 确保模型大小适配canvas
      const modelWidth = model.internalModel.width;
      const modelHeight = model.internalModel.height;
      const aspectRatio = modelHeight / modelWidth;
      const canvasAspectRatio = this.height / this.width;
      let finalWidth;
      if (canvasAspectRatio > aspectRatio) {
        finalWidth = this.width;
      } else {
        finalWidth = this.height / aspectRatio;
      }

      // 设置模型的属性
      model.scale.set(finalWidth / modelWidth);
      model.position.set(this.width / 2, this.height / 2);
      model.anchor.set(0.5);

      // 将模型添加到PIXI的stage上，并开始处理动画
      if (this.application.stage) {
        this.application.stage.addChild(model);
      }
      if (this.application.renderer) {
        this.application.renderer.resize(this.width, this.height);
      }
      if (this.application.ticker) {
        this.application.ticker.add(() => model.update(this.application.ticker.elapsedMS));
      }

      // 设置动画参数和嘴唇同步参数
      // @ts-ignore
      // 假设这是在 Live2dModelLoader.ts 文件的某个方法中
      // 检查 model.internalModel.motionManager.lipSyncIds 是否为空或空数组
      if (!model.internalModel.motionManager.lipSyncIds || model.internalModel.motionManager.lipSyncIds.length === 0) {
        // 如果为空或空数组，则给 _lipSyncIds 赋值 ["ParamMouthOpenY"]
        this._lipSyncIds = ['ParamMouthOpenY'];
      } else {
        // 如果不为空，则直接使用 lipSyncIds 的值
        // @ts-ignore
        this._lipSyncIds = model.internalModel.motionManager.lipSyncIds;
      }
      const definitions: string[] = [];
      for (let definitionsKey in model.internalModel.motionManager.definitions) {
        const definitionItems = model.internalModel.motionManager.definitions[definitionsKey];
        if (definitionItems) {
          for (let i = 0; i < definitionItems.length; i++) {
            definitions.push(`${definitionsKey}_${i}`);
          }
        }
      }
      this._definitions = definitions;
      this._model = model;

      if (this.enabledIdle) {
        this.triggerIdleAnimation();
      }
      return model;
    } catch (error) {
      console.error('Failed to load Live2DModel: ', error);
    }
  }


  public async action(action: string): void {
    if (!this._model) {
      return;
    }
    const actionParts = action.split('_');
    if (actionParts.length == 2) {
      const motionGroup = actionParts[0];
      const motionIndex = Number(actionParts[1]);
      this._model.motion(motionGroup, motionIndex);
    }
  }

  public async immediatelyAction(action: string): void {
    if (!this._model) {
      return;
    }
    const actionParts = action.split('_');
    if (actionParts.length == 2) {
      const motionGroup = actionParts[0];
      const motionIndex = Number(actionParts[1]);
      this._model.motion(motionGroup, motionIndex, MotionPriority.NORMAL);
    }
  }

  public async expression(expression: string): void {
    if (!this._model) {
      return;
    }
    // this.model.expression(expression);
  }

  public async speak(volume: number): void {
    if (!this._model) {
      return;
    }
    this._model.internalModel.coreModel.setParameterValueById(this.lipSyncId, volume);
  }

  public destroy(): void {

    this.isActive = false;
    if (this.timeoutRef !== null) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }

    if (!this._model) {
      return;
    }

    if (this.application.ticker) {
      this.application.ticker.remove(() => this._model?.update(this.application.ticker.elapsedMS));
    }
    if (this.application.stage) {
      this.application.stage.removeChild(this._model);
    }

    this._model.destroy();
    this._model = null;
  }

  get lipSyncIds(): string[] {
    return this._lipSyncIds;
  }

  get definitions(): string[] {
    return this._definitions;
  }

  private async triggerIdleAnimation(): Promise<void> {
    if (!this._model || this.idles.length === 0 || !this.isActive) {
      return;
    }
    // 从idles数组中随机选择一个闲置动画
    const randomIndex = Math.floor(Math.random() * this.idles.length);
    const idleAnimationName = this.idles[randomIndex];
    this.playIdleAnimation(idleAnimationName);
  }

  private async playIdleAnimation(idleAnimationName: string): Promise<void> {

    if (!this.isActive) return;

    // 分解动画名以获取组名和动画索引
    const idleAnimationNameParts = idleAnimationName.split('_');
    if (idleAnimationNameParts.length != 2) {
      console.error(`Invalid idle animation name: ${idleAnimationName}`);
      return;
    }

    const motionGroup = idleAnimationNameParts[0];
    const motionIndex = Number(idleAnimationNameParts[1]);

    // 播放所选的闲置动画
    // 如果可能，获取动画播放时长。需要实现或者估算这个时长。
    const animationDuration = 15000; // 假设所有动画都有3000毫秒的时长，根据实际情况调整
    this._model?.motion(motionGroup, motionIndex, MotionPriority.IDLE)
      .then(() => {
        // 在动画播放完毕后，延迟执行下一次动画播放
        this.timeoutRef = setTimeout(() => this.triggerIdleAnimation(), animationDuration);
      })
      .catch((error) => {
        // 如果动画播放失败，同样延迟尝试下一次
        this.timeoutRef = setTimeout(() => this.triggerIdleAnimation(), animationDuration);
      });
  }

  get model(): Live2DModel | null {
    return this._model;
  }
}
