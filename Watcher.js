class Watcher {
    // 创建观察者, 专门用来观察是否有值变化了,如果变化了,同时老值和新值不同,那么就把值设置成新值
    // 怎么获取数据, 观察谁(哪个变量,比如title.msg等), 当数据真的变化了怎么去更新值得方法
    constructor(vm, expr, callbackSet) {
        this.vm = vm;
        this.expr = expr;
        this.callbackSet = callbackSet;
        // 创建的watcher的时候把当前的这个this挂载到Dep上面
        // this.initWatcher()
        // 创建一个新的观察者的时候,首先获取原始(上次)的值,因为观察者可能调用很多次

        this.initValue = this.getInitValue()
    }
    initWatcher() {
        // console.log("init Watcher")
        Dep.target = this;

        // console.log( Dep.target )

    }
    getInitValue() {
        Dep.target = this;
        // 每次通过第一次获取值,一定走回响应式劫持的get方法
        // 在响应式,里面是这么写的
        // Dep.target && dep.addSubs(Dep.target)
        // 这个意思假如{{a}}的this Watcher 有,那么才增加一个订阅
        // 所以如果这里不把Dep.target 改为null的时候,那么会造成一个问题,
        // 无论是{{b}}还是{{c}} 都会调用的是{{a}}的this,因为{{b}}或者{{c}}跟{{a}}一样, 都是第一次模板编译的时候,直接走了输出方法,那个时候的watcher仅仅是声明了,所以每一次处理完毕了一个变量之后都要把Dep.target的new Watcher实例化的this移除,也就是   Dep.target = null
        // let v = this.getTextValue(content, vm)
        // textUpdate(textNode, v)
        let v = this.getValue(this.vm, this.expr)
        // Dep.target = null
        return v
    }
    // 获取值
    getValue(vm, expr) {
        return expr.split(".").reduce((prev, next) => {
            return prev[next]
        }, vm.$data);
    }
    // 更新方法,会有人调用的,是发布订阅
    update() {
        // 老值,刚开始创建观察者的时候就保存好了
        let oldValue = this.initValue;
        // 新值,重新获取一下子当前的状态就是新值
        let newValue = this.getInitValue();
        if (oldValue !== newValue) {
            // console.log("11")
            // 当新值和老值不相等,将调用一个方法,这个方法暴露给调用者实现了
            this.callbackSet(newValue, oldValue);
        }
    }



}
