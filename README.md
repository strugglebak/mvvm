# mvvm

这是一个理解 `Vue` 框架思想的项目,简单易懂,可快速理解源码并上手

## 为什么要自己实现?
原因自然是不理解不舒服斯基,咳咳,自然是想要理解 `Vue` 的框架到底是个什么?那么为什么一定要去理解??用着不好嘛?
用着当然好,于是自然想更好,我们在碰见一个问题时,特别是类似于设计模式的问题时,就很犯难处,怎么样的代码才是好代码?框架的代码一般怎么去组织比较好,然后他们是怎么去实现的?只有理解了核心思想,使用框架时才能更融会贯通

## MVVM
好了,我们现在看看 `mvvm` 是什么,初次看到这个概念时我以为 `mvvm` 就是 `model`-`view`-`view`-`model`,但实际上它并不是这样的,它是 `model`-`view`-`viewmodel`,好了,这个结构看起来有点像 MVC 啊?是的,这实际上就是 MVC 的升级版,那么 MVC 模式有什么问题?
1. 代码分层上虽然有优势,但是如果逻辑一多,有可能造成大量代码集中在 Controller 层
2. Controller 层的代码可复用性差,因为 Controller 不像 View 和 Model 那样能够很容易的抽象出一些东西,从而进行代码复用,而实际上对于不同的业务而言,你的 View 可以一样,你的 Model 也可以一样,但是你的 Controller 也可以一样吗?
以上,我们为什么需要 MVC 呢?为什么我们的 Controller 不可以像下面这么简单呢?

- 初始化就初始化相应的 View 和 Model
- 监听 Model 层的事件,将 Model 数据传到 View 
- 监听 View 层的事件,将 View 数据传到 Model 

也就是说,只要 Model 和 View 的任何一方有**数据的变化**, Controller 就**通知这一方去做相应的更新操作**,对的,我们要做的就是将 Controller 的功能尽量的简化,并实现最大程度的代码复用,哦好了,我们得先为这个 Controller 取个新的名字,这个名字就叫做 **view-model**,用它实现的方法来替代老旧的 Controller 吧

## 实现的方式
为了改造 Controller ,我们现在引入了一种新的模式: **观察者模式**,这个模式的也叫 **发布订阅模式**,它定义了一种**一对多**的关系,使的多个观察者能够**订阅**同一个**主题**,当这个主题的**状态**发生变化时,便**通知所有的观察者**,使得他们能够**进行自我更新**,思考一下,对应到上面我们能得到什么?我们尝试用代码理解一下看看,首先,假设有一个 View, 它的实现如下
```
<div id="app">{{name}}</div>
```
有一个 VM,它里面有个 Model,实现如下
```
var vm = new Mvvm({
    el: '#app',
    data: {
        name: 'strugglebak'
    }
});
```
上面的例子中,主题应该对应什么?观察者应该对应什么?观察者什么时候才会订阅主题?主题什么时候通知观察者更新呢?

首先,我们知道,根据上面的说明,**谁的状态随时发生变化,谁就是主题**,我们在 View 中要显示一个 name,那么这个 name 的状态就发生变化了,那么**data 中的 name**它就是主题!而观察者是谁呢?很显然是 View 模板中的 `{{name}}`,因为主题变化了,**观察者需要被通知去做自我更新**.然后我们就知道了整个流程了

> 在一开始 VM 进行初始化也就是**开始解析模板时开始订阅主题**,当 `data.name` 发生改变的时候,再通知观察者更新内容

好了,我们怎么才能知道 `data.name` 何时变化呢?我们知道在 DOM 操作中,我们对 DOM 做了哪些修改还可以通过监听 DOM 事件来解决,这本身的数据改变了怎么可能知道?要是有这么个**监听数据变化的函数**的函数就好了

别说,还真有,它的名字叫做 **Object.defineProperty**

## Object.defineProperty
mdn 上的解释大概就是 `Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性。这个方法执行完成后会返回修改后的这个对象。它的用法就是这样 `Object.defineProperty(obj, prop, descriptor)`

- obj: 待处理对象
- prop: 要定义或要修改的属性名
- descriptor: 将要被定义或修改的属性描述符

```
var obj = {}
obj.name = 'strugglebak'
obj['age'] = 18
Object.defineProperty(obj, 'intro', {
    value : 'hello world'
})
console.log(obj)  // {name: 'strugglebak', age: 18, intro: 'hello world'}
```
看!我修改了一个对象的属性!你可能会疑问,阿,这就结束了?没有,接下来才是见证奇迹的时刻
```
var obj = {}
var age 
Object.defineProperty(obj, 'age', {
    get: function(){
        console.log('get age...')
        return age
    },
    set: function(val){
        console.log('set age...')
        age = val
    }
})
obj.age = 100  // 'set age...'
console.log(obj.age) // 'get age...', 100
```
看,我竟然通过一个叫 `get` 和 `set` 的玩意儿实现了数据的监听! 这不就是我正想要的嘛!但是,这里还是要解释一下这两个是干嘛的
`get` 和 `set` 叫**存取描述符**

- get：一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为 undefined。
- set：一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 undefined。

同时,我们在操作一个有属性有内容的对象时还必须设置 `configurable` 和 `enumerable` 为 `true`,不然在修改对象属性时会失败,因为不设置他们默认都是 `false`,即对应**属性不可修改**和**属性不可遍历**

## 数据的劫持
好,现在我们可以实现一个简单的数据劫持的函数了,其实就是监听数据的变化
```
function on(data) {
    if (!data || typeof data !== 'object') { return; }
    for (let key in data) {
        let value = data[key]; // 这里不要用 var
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: ()=> {
                console.log(`get value is '${value}'`);
                return value;
            },
            set: (newValue)=> {
                console.log(`change value from '${value}' to '${newValue}'`);
                value = newValue;
            }
        });
        if (typeof value === 'object') {
            observe(value);
        }
    }
}
```

