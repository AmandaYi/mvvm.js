// 数据劫持
class Observer {
    constructor(data) {
        // console.log(data)
        this.$data = data
        // 对data进行响应式定义劫持
        this.observer(data);
    }

    // 核心方法
    observer(data) {
        if (data && typeof data === "object") {
            // console.log("data是一个对象")
            // 开始数据劫持
            // 需要进行遍历劫持
            Object.keys(data).forEach(key => {

                this.defineReactive(data, key, data[key]);
                // 递归调用进行不断的劫持深层的对象

                this.observer(data[key])
            })
        }
    }
    defineReactive(obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            get: function () {
                // 第一次数据劫持的时候,需要把当前的this放入进去
                // 这里是第一次new Watcher的时候,会走这里
                // 所以可以直接Dep订阅这里
             Dep.target &&   dep.addSubs(Dep.target) 
           
                // console.log(  Dep.target )
                return value;
            },
            set: function (newValue) {

                if (newValue != value) {
                    // 如果newValue是一个对象,也需要把这个对象添加到响应式劫持里面
                    value = newValue
                    that.observer(newValue)
                    // 这里值一旦变化,需要发布只需要调用emitAll方法,通知所有人,数据更新了, 
                    dep.emitAll()
                }
            }

        })
    }
}