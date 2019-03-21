class Dep {
    constructor() {
        // 订阅数组
        this.subs = []
    }

    // 增加一个观察者实例
    addSubs(oneWatcher) {
        // console.log("走到这里了")
        this.subs.push(oneWatcher);
    }
    // 通知全部人, 应该是数据劫持的时候调用这个,比如set的时候会调用这个然后才会触发watcher的更新方法,最后走了text,model这些方法
    emitAll(){
        this.subs.forEach(watcher=>{
            // console.log("数据更新了")
            watcher.update()
        })
    }
}
 

// Dep谁来调用,
// 当第一次读取DOM的时候, 判断了指令之后进行模板和数据编译,
// 然后才是第一次获取值的时候有一个一个new Watcher 实例,
// 这时候读取值得时候,会触发数据响应式劫持的get
// 因此第一次初始化get的时候,可以增加订阅

// 所以,在创建实例的时候, 可以把这个new Watcher实例放到Dep的targer上面,
