import install, { Vue } from "@/vuex/install";
import ModuleCollection from "@/vuex/module/module-collection";
import { forEachValue } from "@/vuex/util";

function getState(store, path) {
  return path.reduce((start, current) => {
    return start[current];
  }, store.state);
}

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    // 根模块，只有是子模块的时候 才需要将子模块的状态定义在根上面
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current];
    }, rootState);
    store._withCommiting(() => {
      Vue.set(parent, path[path.length - 1], rootModule.state);
    });
  }

  // 获取命名空间的前缀
  let namespaced = store._modules.getNamespace(path);
  // rootModule必须是类Module实例对象
  // 将mutations中的函数挂载到相应的模块下并用数组进行收集
  rootModule.forEachMutation((mutationKey, mutationValue) => {
    store._mutations[namespaced + mutationKey] = (store._mutations[namespaced + mutationKey] || []);
    store._mutations[namespaced + mutationKey].push((payload) => {
      // 执行mutations对象里面的函数时会给每个函数传递当前模块下的state
      // mutationValue(rootModule.state, payload);
      // getState函数的作用获取最新的状态值
      store._withCommiting(() => {
        mutationValue(getState(store, path), payload);
      });

      /*
        为什么store.subscribes会在forEachMutation函数中：需要给插件传递当前模块下的store以及传递的参数payload，不在forEachAction实现的原因是由于actions对象中一般处理的是异步函数
       */
      store.subscribes.forEach(fn => fn({ type: mutationKey, payload }, store.state));
    });
  });
  // 将actions中的函数挂载到相应的模块下并用数组进行收集
  rootModule.forEachAction((actionKey, actionValue) => {
    store._actions[namespaced + actionKey] = (store._actions[namespaced + actionKey] || []);
    store._actions[namespaced + actionKey].push((payload) => {
      // 执行actions对象里面的函数时会给每个函数传递当前模块下的store， 这就是为什么actions对象中的函数中可以解构出commit函数了 例如：add({ commit }, payload)
      let result = actionValue(store, payload);
      return result;
    });
  });
  rootModule.forEachGetter((getterKey, getterValue) => {
    if (store._wrappedGetters[namespaced + getterKey]) {
      return console.warn("duplicate key");
    }
    store._wrappedGetters[namespaced + getterKey] = () => {
      // 执行getterValue对象里面的函数时会给每个函数传递当前模块下的state
      return getterValue(rootModule.state);
    };
  });
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module);
  });
}

// 利用VUE实现 响应式数据以及计算属性的实现
function resetStoreVM(store, state) {
  let oldVm = store._vm;
  store.getters = {};
  const computed = {};
  const wrappendGetters = store._wrappedGetters;
  forEachValue(wrappendGetters, (getterKey, getterValue) => {
    computed[getterKey] = getterValue;
    Object.defineProperty(store.getters, getterKey, {
      get: () => {
        return store._vm[getterKey];
      }
    });
  });
  store._vm = new Vue({
    data: {
      $$state: state
    }, computed
  });
  if (store.strict) {
    store._vm.$watch(() => store._vm._data.$$state, () => {
      console.assert(store._commiting, "out");
    }, { sync: true, deep: true });
  }
  if (oldVm) {
    Vue.nextTick(() => oldVm.$destroy());
  }
}

class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);
    this._wrappedGetters = Object.create(null);
    this.strict = options.strict;// 是否为严格模式，严格模式下 严禁vuex中的state数据在mutations之外的地方进行修改
    // 设置一个变量_commiting 若为true 则表示在mutation中更改的
    this._commiting = false;
    this.subscribes = [];
    this.plugins = options.plugins || [];
    /*
    installModule的作用 ：
    将所有的mutations整合到this._mutations
    将所有的actions整合到this._actions
    将所有的getters整合到this._wrappedGetters
     */
    installModule(this, this._modules.root.state, [], this._modules.root);
    // 将计算属性和state声明到实例上
    resetStoreVM(this, this._modules.root.state);
    // 插件需要立即执行
    this.plugins.forEach(plugin => plugin(this));
  }

  /* 属性选择器 等价于
   Object.defineProperty(this, "state", {
      get() {
        return this._vm._data.$$state;
      }
    });
   */
  get state() {
    return this._vm._data.$$state;
  }

  _withCommiting(fn) {
    this._commiting = true;
    fn();
    this._commiting = false;
  }

  replaceState(state) {
    this._withCommiting(() => {
      this._vm._data.$$state = state;
    });
  }

  commit = (type, payload) => {
    this._mutations[type].forEach(fn => fn.call(this, payload));
  }

  dispatch = (type, payload) => {
    // this._actions[type].forEach(fn => fn.call(this, payload));
    if (this._actions[type]) {
      return Promise.all(this._actions[type].map(fn => fn.call(this, payload)));
    }
  }

  // 新添加的module是用户的module 并没有对其包装 获取不到_raw等一系列属性
  registerModule(path, module) {
    this._modules.register(path, module);
    // 挂载module时，需要获取到包装后的结果
    installModule(this, this.state, path, module.newModule);
    resetStoreVM(this, this.state);
  }

  //   vuex插件机制
  subscribe(fn) {
    this.subscribes.push(fn);
  }
}

export default {
  Store, install
};
