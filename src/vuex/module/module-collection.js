import { forEachValue } from "@/vuex/util";
import Module from "@/vuex/module/module";

// 扁平化数据 例如[a]:module,[c]:module
export default class ModuleCollection {
  constructor(options) {
    this.root = null;
    this.register([], options);
  }

  getNamespace(path) {
    let module = this.root;
    return path.reduce((str, key) => {
      module = module.getChild(key);
      return str + (module.namespaced ? `${key}/` : "");
    }, "");
  }

  register(path, rootModule) {
    let newModule = new Module(rootModule);
    rootModule.newModule = newModule;// 将用户的属性和包装后的关联在一起 解决registerModule函数的问题
    if (this.root == null) {
      this.root = newModule;
    } else {
      let parent = path.slice(0, -1).reduce((start, current) => {
        return start.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rootModule.modules) {
      /*
      forEachValue函数：
      forEachValue(obj, cb) {
       Object.keys(obj).forEach((key) => {
          cb(key, obj[key]);
        });
      }
       */
      // 进行递归遍历根模块下的子模块并进行扁平化处理
      forEachValue(rootModule.modules, (moduleName, moduleValue) => {
        this.register(path.concat(moduleName), moduleValue);
      });
    }
  }
}
