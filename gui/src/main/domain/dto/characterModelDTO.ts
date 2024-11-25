class CharacterModelDTO {

  id: number | null;
  name: string;
  category: string;
  type: string;
  icon_path: string;
  model_path: string;
  idles: any;
  lip_sync_id: string;
  expression_mapping?: any;
  action_mapping?: any;

  constructor(id: number | null, name: string, category: string, type: string, icon_path: string, model_path: string, idles: any, lip_sync_id: string, expression_mapping: any, action_mapping: any) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.type = type;
    this.icon_path = icon_path;
    this.model_path = model_path;
    this.idles = idles;
    this.lip_sync_id = lip_sync_id;
    this.expression_mapping = expression_mapping;
    this.action_mapping = action_mapping;
  }

  toFrom() {

    const expr_happy = this.expression_mapping['expr_happy'];
    const expr_sad = this.expression_mapping['expr_sad'];
    const expr_angry = this.expression_mapping['expr_angry'];
    const expr_shy = this.expression_mapping['expr_shy'];
    const expr_surprise = this.expression_mapping['expr_surprise'];
    const act_say_hello = this.action_mapping['act_say_hello'];
    const act_act_cute = this.action_mapping['act_act_cute'];

    return new CharacterLive2DModelFromDTO(
      this.id,
      this.name,
      this.category,
      this.type,
      this.icon_path,
      this.model_path,
      this.idles,
      this.lip_sync_id,
      expr_happy,
      expr_sad,
      expr_angry,
      expr_shy,
      expr_surprise,
      act_say_hello,
      act_act_cute
    );
  }
}

class CharacterLive2DModelFromDTO {

  id: number;
  name: string;
  category: string;
  type: string;
  icon_path: string;
  model_path: string;
  idles: any;
  lip_sync_id: string;
  expr_happy: string;
  expr_sad: string;
  expr_angry: string;
  expr_shy: string;
  expr_surprise: string;
  act_say_hello: string;
  act_act_cute: string;


  constructor(id: number, name: string, category: string, type: string, icon_path: string, model_path: string, idles: any, lip_sync_id: string, expr_happy: string, expr_sad: string, expr_angry: string, expr_shy: string, expr_surprise: string, act_say_hello: string, act_act_cute: string) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.type = type;
    this.icon_path = icon_path;
    this.model_path = model_path;
    this.idles = idles;
    this.lip_sync_id = lip_sync_id;
    this.expr_happy = expr_happy;
    this.expr_sad = expr_sad;
    this.expr_angry = expr_angry;
    this.expr_shy = expr_shy;
    this.expr_surprise = expr_surprise;
    this.act_say_hello = act_say_hello;
    this.act_act_cute = act_act_cute;
  }

  toDTO(): CharacterModelDTO {
    const expression_mapping = {
      expr_happy: this.expr_happy,
      expr_sad: this.expr_sad,
      expr_angry: this.expr_angry,
      expr_shy: this.expr_shy,
      expr_surprise: this.expr_surprise
    };
    const action_mapping = {
      act_say_hello: this.act_say_hello,
      act_act_cute: this.act_act_cute
    };

    return new CharacterModelDTO(
      this.id,
      this.name,
      this.category,
      this.type,
      this.icon_path,
      this.model_path,
      this.idles,
      this.lip_sync_id,
      expression_mapping,
      action_mapping);
  }
}

export { CharacterModelDTO, CharacterLive2DModelFromDTO };
