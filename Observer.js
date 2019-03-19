class Observer {
    constructor(data){
        console.log(data)
    }
    // 判断传入的是不是对象，如果是对象的话，那么就进行劫持监听
    observer (data) {
        if(data &&typeof data == "object") {
            for(let key in  data){
                this.defineReactive(data,key,data[key])
            }
        }
    }
    // 响应式监听
    defineReactive(data,key,value){
        Object.defineProperty(data, key,{ 
            set:function(newValue){
                console.log(newValue)
                data[key] = newValue
            },
            get:function(){
                return value;
            }
        })
    }







}