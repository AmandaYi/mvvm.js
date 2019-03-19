// 数据劫持
class Observer {
    constructor(data) {
        console.log(data)
        // 对data进行响应式定义劫持
        this.observer(data);
    }

    // 核心方法
    observer(data) {
        if (data && typeof data === "object") {
            console.log("data是一个对象")
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

        Object.defineProperty(obj, key, {
            get: function () {
                return value;
            },
            set: function (newValue) {
                if (newValue !== obj[key]) {
                    value = newValue
                    console.log("改变了")
                }
            }

        })
    }
}