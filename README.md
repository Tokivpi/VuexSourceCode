## 使用 Vue CLI脚手架简易地实现Vuex

> #### 初始化：
>
> ```
> npm install
> ```
>
> #### 运行：
>
> ```
> npm run dev
> ```

##### 下面是src/vuex中各个文件做了哪些事情

> **install：**
>
> - 保存将通过Vue.use获取到的Vue，并在组件初始化数据前在组件的属性添加**$store**属性，**所有的$store的属性都指向根组件的$store的属性值$options.store**
>
> **index:**
>
> - Store类中重要的函数(**installModule、resetStoreVM**)
>   - **installModule**：
>     - 所有模块下的mutations进行扁平化处理整合到“this._mutations”属性上，
>     - 所有模块下的actions进行扁平化处理整合到“this._actions”属性上，
>     - 所有模块下的getters进行扁平化处理整合到“this._wrappedGetters”属性上，
>   - **resetStoreVM:**
>     - 基于Vue.use获取到的Vue，实现响应式数据（state）以及计算属性（wrappedGetters）的实现
> - Store中属性
>   - strict：是否为严格模式，严格模式下，严禁vuex中的state数据在mutations之外的地方进行修改
>   - "_committing":表示commit状态，用于判断是否是通过commit修改state属性
>
> **module文件夹：**
>
> - module-collection:该文件实现怎么将store数组进行扁平化处理，以及创建模块实例对象
>
>   ```
>   let newModule = new Module(rootModule)
>   ```
>
> - module：该文件描述 所创建的模块下的所具有的属性以及方法