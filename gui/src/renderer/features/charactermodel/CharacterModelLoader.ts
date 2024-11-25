


export abstract class BaseCharacterModel {

  public abstract speak(volume: number): void;

  public abstract expression(expression: string): void;

  public abstract action(action: string): void;

  public abstract destroy(): void;

}


export class CharacterModelLoader {


}
