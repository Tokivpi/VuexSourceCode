export let Vue;

const install = _Vue => {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      // 判断是否为根实例
      if (this.$options.store) {
        this.$store = this.$options.store;
      } else if (this.$parent && this.$parent.$store) {
        this.$store = this.$parent.$store;
      }
    }
  });
};

export default install;
