class MVVM {
    // 接受两个参数, 一个是元素elem,一个是data对象 
    constructor(options) {
        this.$el = options.el
        this.$data = options.data
        let computed = options.computed;
        let methods = options.methods;
        // 需要分3步
        if (this.$el) {

            // 1. 编译模板
            new Compiler(this.$el, this)
            // 2. 数据劫持
            new Observer(this.$data)
            // 3. 数据监听
            // 见Watcher类
            // 4. 发布和订阅阶段
            // 见Dep类
            // 对于计算属性
            for (let key in computed) {
                Object.defineProperty(this.$data, key, {
                    get: () => {
                        return computed[key].call(this)
                    }
                })
            }
            // 对于方法
            for (let key in methods) {
                Object.defineProperty(this, key, {
                    get: () => {
                        methods[key]
                    }
                })
            }
            // 辅助功能
            // 把this.App.$data 变为this.$data
            this.proxy(this.$data)
        }
    }
    proxy(data) {
        for (let key in data) {
            Object.defineProperty(this,key, {
                get: function () {
                    return data[key]
                },
                set: function (newValue) {
                    data[key] = newValue
                }
            })
        }
    }


}


