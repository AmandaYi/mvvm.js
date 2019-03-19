class MVVM {
    // 接受两个参数, 一个是元素elem,一个是data对象 
    constructor(options) {
        this.$el = options.el
        this.$data = options.data
        // 需要分3步
        // 1. 编译模板
        new Compiler(this.$el, this)
        // 2. 数据劫持
        new Observer(this.$data)
        // 3. 数据监听

        // 4. 发布和订阅阶段
    }
}


