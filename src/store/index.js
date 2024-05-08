import Vue from "vue";
import Vuex from "@/vuex";

Vue.use(Vuex);

const persitsPlugin = function(store) {
  let state = localStorage.getItem("VUEX");
  if (state) {
    store.replaceState(JSON.parse(state));
  }
  store.subscribe(function(mutationType, rootState) {
    localStorage.setItem("VUEX", JSON.stringify(rootState));
  });
};
const store = new Vuex.Store({
  strict: true,
  // 提高扩展性
  plugins: [
    persitsPlugin
  ],
  state: {
    age: 13
  },
  actions: {
    add({ commit }, payload) {
      // 测试请求
      return new Promise(resolve => {
        setTimeout(() => {
          commit("add", payload);
          resolve();
        }, 1000);
      });
    }
  },
  mutations: {
    add(state, payload) {
      state.age += payload;
    }
  },
  getters: {
    myAge(state) {
      return state.age + 20;
    }, myName(state) {
      return "zhangsan";
    }
  },
  modules: {
    a: {
      namespaced: true,
      getters: {
        myAge(state) {
          console.log("runner");
          return state.age + 2000;
        }, myName(state) {
          return "zhangsan";
        }
      },
      state: {
        age: 200
      },
      mutations: {
        add(state, payload) {
          console.log("a模块下的mytations");
        }
      },
      modules: {
        d: {
          namespaced: true,
          state: {
            age: 15000, name: "d模块"
          },
          mutations: {
            add(state, payload) {
              state.age += payload;
            }
          },
          getters: {
            myAge(state) {
              console.log("runner");
              return state.age + 20;
            }
          }
        }
      }
    },
    c: {
      namespaced: true,
      state: {
        age: 400
      },
      mutations: {
        add(state, payload) {
          state.age += payload;
        }
      }
    }
  }

});
store.registerModule(["a", "q"], {
  namespaced: true, state: {
    age: 100
  }, getters: {
    myAge(state) {
      return state.age + 1;
    }
  }, mutations: {
    add(state) {
      state.age += 10;
    }
  }
});
export default store;
