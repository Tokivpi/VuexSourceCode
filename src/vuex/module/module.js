import { forEachValue } from "@/vuex/util";

export default class Module {
  constructor(module) {
    this._raw = module;
    this._children = {};
    this.state = module.state;
  }

  get namespaced() {
    return !!this._raw.namespaced;
  }

  addChild(key, module) {
    this._children[key] = module;
  }

  getChild(key) {
    return this._children[key];
  }

  // 进行mutation的整合
  forEachMutation(cb) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, cb);
    }
  }

  // 进行action的整合
  forEachAction(cb) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, cb);
    }
  }

  // 进行Getter的整合
  forEachGetter(cb) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, cb);
    }
  }

  // 进行module的整合
  forEachModule(cb) {
    forEachValue(this._children, cb);
  }
}
