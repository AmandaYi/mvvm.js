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
        console.log(this.el)
        // 2. 把全部的元素移入到内存中进行操作
        let fragElement = this.nodeToFragElement(this.el)
        // 输出检查是不是已经把原始DOM中的节点移入到内存中了,
        // 是否DOM中el元素下面没有内容了
        // 能否在内存中打印出来元素切片DOM
        console.log(fragElement)
        // 3. 在内容中对节点的内容进行元素的替换,编译模板或者数据编译
        // 用一个方法把内容DOM切片中元素进行元素替换
        this.complie(fragElement);
        // 4. 把内容中处理好的文档片段放入到页面中
        this.el.appendChild(fragElement)
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
                // console.log("使用文本处理")
            }
        })
    }
    // 模板解析函数处理问题元素
    complieText(text) {
        // 查看是不是模板字符串的标记，如果过是的话，用通用函数去处理，如果不是的话，直接显示
        let content = text.textContent;
        // console.log("处理文本")
        // 这里匹配的是content，而不是text
        if (isBrackets.test(content) == true) {
            // console.log("调用第三方函数处理")
            // 调用函数去处理，
            CompliUtil["text"](text, content, this.vm)
        }
        // 不是的话。不用管
    }

    // 处理一些属性指令
    complieElement(child) {
        // console.log(child)
        // 1.查看child元素有多少个属性， 
        let attrs = child.attributes;
        // 2.对每个属性都进行判断，
        Array.from(attrs).forEach(att => {
            // 得到属性名，属性值
            let attrName = att.name;
            let attrValue = att.value
            // console.log(attrName)
            // console.log(value)
            // 3.如果属性有是v-开头的，那么就是指令
            if (isDirective(attrName) == true) {
                // 4.然后使用对应的第三方的函数进行处理
                // console.log(att)
                // console.log(attrName)
                // console.log(attrValue)
                // 获取指令
                // 然后把得到的v-后面的一部分传给第三方函数进行处理
                let directive = attrName.split("-")[1]
                // v-html
                // v-model
                // 如果是v-bind:on，那么怎么办呢？ bind:on切分
                // 得到指令的类型 bind,html这一类的
                let directiveType = directive.split(":")[0]
                // 得到指令的值， 一个回掉什么的
                let directiveValue = directive.split(":")[1]
                // 因为model不需要directiveValue的吗，所以放到最后
                CompliUtil[directiveType](child, attrValue, this.vm, directiveValue)

            }
        })
    }

}

const CompliUtil = {
    // 得到数据
    getValue(content, vm) {

        // 如果数据是title.msg是一个对象，那么需要不停的遍历下去进行取值
        return content.split(".").reduce((data, currentData) => {
            // console.log(data)
            return data[currentData]
        }, vm.$data)
    },
    // 编译文本
    "text": function (textNode, content, vm) {
        // console.log(text)
        // console.log(content)  // {{title.msg}} {{name}}
        // console.log(vm)
        // this.getValue("title.msg", vm)
        // 去掉模板字符{{}}
        let v = content.replace(/\{\{(.+?)\}\}/img, (oldValue, newValue) => {
            // 替换之前的值
            // console.log(oldValue)
            // // 替换之后的值
            // console.log(newValue)
            return this.getValue(newValue, vm)
        })
        this.domUpdate["textUpdate"](textNode, v)

    },
    // 实现model
    // directiveValue指令的值可以没有
    "model": function (child, attrValue, vm) {
        // console.log(child)
        // console.log(attrValue)
        // console.log(vm)
        let v = this.getValue(attrValue, vm)
        // 监听输入事件
        // child.addEventListener("input",(e)=>{
        //     console.log(e.target.value);
            
        //     vm.$data.title.msg = e.target.value
           
        // })
        this.domUpdate["modelUpdate"](child, v)
    },
    // 处理页面更新
    domUpdate: {
        // 文本节点更新
        textUpdate: function (textNode, value) {
            textNode.textContent = value
        },
        modelUpdate: function (inputNode, value) {
            inputNode.value = value
        }

    }
}