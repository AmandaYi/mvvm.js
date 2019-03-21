// 正则表达式
// 是不是模板字符串的标记{{}}
let isBrackets = new RegExp(/\{\{(.+?)\}\}/)
let isDirective = (attrName) => { return attrName.startsWith("v-") }

// 模板编译,数据编译
class Compiler {
    constructor(el, vm) {
        this.vm = vm
        // 1. 判断是不是一个元素
        this.el = null

        if (this.isElementNode(el) == true) {
            this.el = el
        } else {
            // 如果是个字符串,那么用方法寻找
            this.el = document.querySelector(el)
        }
        // console.log(this.el)
        if (this.el) {
            // 2. 把全部的元素移入到内存中进行操作
            let fragElement = this.nodeToFragElement(this.el)
            // 输出检查是不是已经把原始DOM中的节点移入到内存中了,
            // 是否DOM中el元素下面没有内容了
            // 能否在内存中打印出来元素切片DOM
            // console.log(fragElement)
            // 3. 在内容中对节点的内容进行元素的替换,编译模板或者数据编译
            // 用一个方法把内容DOM切片中元素进行元素替换
            this.complie(fragElement);
            // 4. 把内容中处理好的文档片段放入到页面中
            this.el.appendChild(fragElement)
        }

    }


    /* 辅助方法 */
    // 判断是不是一个元素,判断传入的是#app还是document.getElementById("#app")
    isElementNode(el) {
        // 判断元素的nodeType是不是为1,如果是1则是元素,否则则是文本
        return el.nodeType === 1
    }
    /* 模板编译的核心方法 */
    // 把el下面的全部的元素放入到内容中
    nodeToFragElement(node) {
        // 创建一个切片
        let fragElement = document.createDocumentFragment();
        // 思路
        // 根据fragElement的特有属性, 当追加一个之后,原始dom将会不会存在
        // 那么, 把第一个元素移走之后,
        // 原始的DOM中,之前的元素的第二个元素就会变为第一个元素
        // 这样子通过无限循环的方式可以不断的把原始的DOM中的元素移到内存元素切片中 
        let YuanDomFirstChild = undefined;
        while (YuanDomFirstChild = node.firstChild) {
            // 内存中的元素切片获取
            fragElement.appendChild(YuanDomFirstChild);
        }
        // 把内存中的元素DOM切片返回回去
        return fragElement;
    }
    // 模板解析函数处理元素DOM元素
    complie(node) {
        // 获取全部的子节点
        let children = node.childNodes;
        // 对全部的子节点进行遍历，
        Array.from(children).forEach(item => {
            // 如果是元素的话进行递归调用函数，用来解决子元素
            if (this.isElementNode(item)) {
                // 这里调用每一个div标签的属性处理
                this.complieElement(item)
                // 直到最后一个元素不再是元素为止，
                this.complie(item)
            } else {
                // 同时遍历到最后一个元素的时候，如果是文本的话，
                // 用文本处理就行
                this.complieText(item)
            }
        })
    }
    // 处理一些属性指令
    complieElement(child) {
        // console.log(child)
        // 1.查看child元素有多少个属性， 
        let attrs = child.attributes;
        // 2.对每个属性都进行判断，
        Array.from(attrs).forEach(attr => {
            // 得到属性名，属性值
            let attrName = attr.name;
            let attrValue = attr.value
            // 3.如果属性有是v-开头的，那么就是指令
            if (isDirective(attrName) == true) {
                // 4.然后使用对应指令解析函数进行处理
                // 然后把得到的v-后面的一部分传给第三方函数进行处理
                let [_, directive] = attrName.split("-")
                // 使用 : 拆分可能有2种结果, 
                // 如果是html,那么会得到 [html,undefined]
                // 如果是bind:on,那么会得到 [bind,on]
                let [directiveType, directiveValue] = directive.split(":")
                // 因为比如html,model等不需要directiveValue的，所以放到最后,
                // 开始-----------------------------------------函数解析
                CompliUtil[directiveType](child, attrValue, this.vm, directiveValue)

            }
        })
    }

    // 模板解析函数处理问题元素
    complieText(text) {
        // 查看是不是模板字符串的标记，如果过是的话，用通用函数去处理，如果不是的话，直接显示
        let content = text.textContent;
        // 这里匹配的是content，而不是text
        if (isBrackets.test(content) == true) {
            // 开始-----------------------------------------函数解析
            CompliUtil["text"](text, content, this.vm)
        }
    }

}

const CompliUtil = {
    // 得到数据
    getValue(content, vm) {
        // 如果数据是title.msg是一个对象，那么需要不停的遍历下去进行取值
        return content.split(".").reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    // 得到文本{{}}的值
    getTextValue(content, vm) {
        return content.replace(/\{\{(.+?)\}\}/img, (_, newValue) => {
            return this.getValue(newValue, vm)
        })
    },
    setValue(vm, expr, value) { //vm.$data 'school.name'  =  姜文
        expr.split('.').reduce((data, current, index, arr) => {
            if (index == arr.length - 1) {
                return data[current] = value;
            }
            return data[current];
        }, vm.$data);
    },
    // 编译文本,content是一个表达式, {{a}} {{b}} ...
    "text": function (textNode, content, vm) {
        // console.log(textNode)
        // 去掉模板字符{{}}
        let v = this.getTextValue(content, vm)
        // console.log(v)
        let textUpdate = this.domUpdate["textUpdate"]
        content.replace(/\{\{(.+?)\}\}/, (...args) => {
            new Watcher(vm, args[1], () => {
                textUpdate(textNode, this.getTextValue(content, vm))
            })
            return this.getValue(args[1], vm)
        })
        textUpdate(textNode, v)

    },
    // model
    // directiveValue指令的值可以没有
    "model": function (child, expr, vm) {
        let fn = this.domUpdate['modelUpdate'];
        new Watcher(vm, expr, (newVal) => { // 给输入框加一个观察者 如果稍后数据更新了会触发此方法，会拿新值 给输入框赋予值
            fn(child, newVal);
        });
        child.addEventListener('input', (e) => {
            let value = e.target.value; // 获取用户输入的内容
            this.setValue(vm, expr, value);
        })
        let value = this.getValue(expr, vm); // 珠峰
        fn(child, value);
        return
        console.log("1")
        let v = this.getValue(attrValue, vm)
        let modelUpdate = this.domUpdate["modelUpdate"]
        console.log(child)
        modelUpdate && modelUpdate(child, v)
        child.addEventListener('input', (e) => {
            let value = e.target.value; // 获取用户输入的内容
            modelUpdate && modelUpdate(child, value);
        })
        // // 这里创建一个观察实例,同时,重新获取一下新值
        new Watcher(vm, v, () => {
            // console.log("model")
            // 当值变化的时候,才会自动执行这个回调方法进行重新获取新值,然后更新新值
            let v = this.getValue(attrValue, vm)
            modelUpdate && modelUpdate(child, v)
        })


    },
    // 处理页面更新
    domUpdate: {
        // 文本节点更新
        textUpdate: function (textNode, value) {
            textNode.textContent = value
        },
        modelUpdate: function (inputNode, value) {
            console.log(1);
            inputNode.value = value
        }

    }
}