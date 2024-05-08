<template>
  <div id="app">
    <div>根模块下的state：{{ $store.state.age }}</div>
    <div>根模块下的getter：{{ $store.getters.myAge }}</div>
    <hr/>
    <div>a模块下的：{{ $store.state.a.age }}</div>
    <div>a模块下的getter：{{ $store.getters['a/myAge'] }}</div>
    <hr/>
    <div>d模块下的state：{{ $store.state.a.d.age }}</div>
    <button @click="$store.commit('a/d/add',3)">调用d模块下的mutations下的add方法</button>
    <hr/>
    <div>基于store中的registerModule方法将q模块添加到a模块下</div>
    <div>q模块的年龄是：{{ $store.state.a.q.age }}</div>
    <div>q模块的计算属性{{ $store.getters['a/q/myAge'] }}</div>
    <button @click="$store.commit('a/q/add')">更改q</button>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>
