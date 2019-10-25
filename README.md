<div align="center">
    <img src="https://i.loli.net/2019/02/28/5c76cc109564e.png" width=600>
</div>

# mvvm

这是一个理解 `Vue` 框架思想的项目,简单易懂,可快速理解源码并上手

## 为什么要自己实现?
原因自然是不理解不舒服斯基,咳咳,自然是想要理解 `Vue` 的框架到底是个什么?那么为什么一定要去理解??用着不好嘛?
用着当然好,于是自然想更好,我们在碰见一个问题时,特别是类似于设计模式的问题时,就很犯难处,怎么样的代码才是好代码?框架的代码一般怎么去组织比较好,然后他们是怎么去实现的?只有理解了核心思想,使用框架时才能更融会贯通

## MVVM
好了,我们现在看看 `mvvm` 是什么,初次看到这个概念时我以为 `mvvm` 就是 `model`-`view`-`view`-`model`,但实际上它并不是,它是 `model`-`view`-`viewmodel`,但是好像这个结构看起来有点像 MVC 啊?是的,这实际上就是 MVC 的升级版,那么 MVC 模式有什么问题?
1. 代码分层上虽然有优势,但是如果逻辑一多,有可能造成大量代码集中在 Controller 层
2. Controller 层的代码可复用性差,因为 Controller 不像 View 和 Model 那样能够很容易的抽象出一些东西,从而进行代码复用,而实际上对于不同的业务而言,你的 View 可以一样,你的 Model 也可以一样,但是你的 Controller 也可以一样吗?
以上,我们为什么需要 MVC 呢?为什么我们的 Controller 不可以做得像下面那样简单呢?

- 初始化就初始化相应的 View 和 Model
- 监听 Model 层的事件,将 Model 数据传到 View 
- 监听 View 层的事件,将 View 数据传到 Model 

也就是说,只要 Model 和 View 的任何一方有**数据的变化**, Controller 就**通知这一方去做相应的更新操作**,对的,我们要做的就是将 Controller 的功能尽量的简化,并实现最大程度的代码复用,为了升级,我们得先为这个 Controller 取个新的名字,这个名字就叫做 **view-model**,用它实现的方法来替代老旧的 Controller 吧

## 实现的方式
为了改造 Controller ,我们现在引入了一种新的模式: **观察者模式**,这个模式的也叫 **发布订阅模式**,它定义了一种**一对多**的关系,使的多个观察者能够**订阅**同一个**主题**,当这个主题的**状态**发生变化时,便**通知所有的观察者**,使得他们能够**进行自我更新**.现在稍微思考一下,对应到上面我们能得到什么?

我们尝试用代码理解一下看看.假设有一个 View, 它的实现如下
```html
<div id="app">{{name}}</div>
```
有一个 VM,它里面有个 Model,实现如下
```javascript
var vm = new Mvvm({
    el: '#app',
    data: {
        name: 'strugglebak'
    }
});
```
上面的例子中,主题应该对应什么?观察者应该对应什么?观察者什么时候才会订阅主题?主题什么时候通知观察者更新呢?

首先,我们知道,根据上面的说明,**谁的状态随时发生变化,谁就是主题**,我们在 View 中要显示一个 name,那么这个 name 的状态就发生变化了,那么**data 中的 name**它就是主题!而观察者是谁呢?很显然是 View 模板中的 `{{name}}`,因为主题变化了,**观察者需要被通知去做自我更新**.然后整个流程就是如下描述

> 在一开始 VM 进行初始化也就是**开始解析模板时开始订阅主题**,当 `data.name` 发生改变的时候,再通知观察者更新内容

那我们怎么才能知道 `data.name` 何时变化呢?我们知道在 DOM 操作中,对 DOM 做了哪些修改还可以通过监听 DOM 事件来解决,但这本身的数据改变了怎么可能知道?要是有这么个**监听数据变化的函数**的函数就好了

别说,还真有,它的名字叫做 **Object.defineProperty**

## Object.defineProperty
mdn 上的解释大概就是

> `Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性。这个方法执行完成后会返回修改后的这个对象。

它的用法就是这样 `Object.defineProperty(obj, prop, descriptor)`

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
            on(value); // 递归
        }
    }
}
```
提示一下上面的 `let value` 为何不能用 `var value`,用了 `var` 之后 `value` 变量会提升到整个作用域范围,它里面就保存着一个变量的地址,等下个变量变化了它就存放的是下个变量的地址,所以当程序结束时它存放的就是最后一个变量的地址,这样就出 bug 了.然后数据怎么劫持的?
```
let data = {
    name: 'strugglebak'
}
console.log(data.name) // get value is 'strugglebak'
data.name = 'kabelggurts' // change value from 'strugglebak' to 'kabelggurts'
```
我打印这个属性就是在调用 `get` 方法,我赋值这个属性就是在调用 `set` 方法,我只要在这两个方法之间做一些逻辑的操作,就实现了数据劫持

## 观察者模式
接下来我们将实现一个最简单的观察者
```
// 观察者
function Observer(options) {
    let {name} = options;
    this.subjects = {};
    this.name = name;
}
Observer.prototype.update = function() {
    console.log(`'${this.name}' 执行 update 函数`);
}
Observer.prototype.subscribe = function(subject) {
    this.subjects[subject.id] = subject;
    console.log(`'${this.name}' 订阅了 '${subject.name}'`);
}
```
这个观察者有两个函数,一个是更新 `update`,一个是订阅 `subscribe`

然后我们再实现一个主题
```
// 主题
function Subject(name='') {
    this.name = name;
    this.observers = [];
}
Subject.prototype.addObserver = function(observer) {
    this.observers.push(observer);
}
Subject.prototype.removeObserver = function(observer) {
    let index = this.observers.indexOf(observer);
    if (index >= 0) {
        this.observers.splice(index, 1);
    }
}
Subject.prototype.emit = function() {
    console.log('Subject 通知所有 Observer 执行 update 函数');
    this.observers.forEach(observer => {
        observer.update();
    });
}
```
这个主题有 3 个函数,它能够添加和删除观察者,当其中最重要的是,它能够通知 (`emit`) 其他所有的观察者执行它自己的 `update` 函数,所以这个主题里面必须要维护一个观察者的数组

使用如下
```
let subject = new Subject('subject')
let observer = new Observer('observer')
observer.update = function() {
  console.log('observer update')
}
observer.subscribe(subject)  //观察者订阅主题
subject.emit() // 主题更新
```

## 单向绑定
有了以上的知识点,我们现在就可以实现一个简单的单向数据流的框架了.那么什么是单向数据流,就是说我们修改这个 model 的 `name` 属性时,模板相应的会发生变化
所以我们就需要一个 `Mvvm` 的对象
```
function Mvvm(options) {
    this.init(options);
    on(this.$data); // 监听数据变化
    new Compiler(this).compile(); // 编译模板
}
Mvvm.prototype.init = function(options) {
    let {el, data} = options;
    this.$el = document.querySelector(el);
    this.$data = data || {};
}
```
还是按照我们之前的思路来的不是嘛,接下来就要实现解析模板的对象了,它大概有如下几种方法
```
function Compiler(vm) {
    this.vm = vm;
    this.node = this.vm.$el;
}
Compiler.prototype.compile = function() {
    this.parse(this.node); // 解析元素中出现的 {{ }}
}
```
先从简单的开始吧,首先它拿到一个 vm, 然后开始解析,这挺好理解,我们再尝试者解决一下 `parse` 这个函数
```
Compiler.prototype.parse = function(node) {
    if (node.nodeType === Node.ELEMENT_NODE) { // 这个 node 是个元素节点
        node.childNodes.forEach(childNode => {
            this.parse(childNode); // 递归解析
        });
    } else if (node.nodeType === Node.TEXT_NODE) { // 这个 node 是个文本
        this.render2Text(node); // 将 node 渲染成文本
    }
}
```
以上的代码也挺好理解(这里只做一些简单的判断避免代码变得复杂),我们的目的是要找出那个文本节点,因为我们知道 DOM 是个树结构,那么自然而然我们这里可以想到递归来寻找,无非就是没有找到就递归,找到了就渲染,好,现在看看它是怎么渲染这个文本节点的
```
Compiler.prototype.render2Text = function(node) {
    let regex = /{{(.+?)}}/g; // 正则，匹配 {{}} 字符串
    let match;
    while (match = regex.exec(node.nodeValue)) {
        let key = match[1].trim();  // "name"
        let value = match[0];       // "{{name}}"
        node.nodeValue = node.nodeValue.replace(value, this.vm.$data[key]);
    }
}
```
用正则将 text 文本中的 `{{name}}` 替换成 `data` 中的属性 `name` 对应的值,这样一来,基本上一刷新就能渲染上去

但是这样还不够,因为下次数据变化了就没有刷新了,所以我们需要在这个函数里面再添加一个监听函数
```
...
node.nodeValue = node.nodeValue.replace(value, this.vm.$data[key]);

// 当对应的 data 项的数据再次发生变化时，需要再次渲染模板, 将旧数据替换成新数据
this.listenDataChange({
    vm: this.vm,
    key: key,
    callback: (newValue, oldValue)=> {
        node.nodeValue = node.nodeValue.replace(oldValue, newValue); // 传一个回调,将旧数据替换成新数据
    },
});
...
```
这个监听函数是这样实现的
```
Compiler.prototype.listenDataChange = function(options) {
    // 为每个变化的数据添加 observer
    new Observer(options);
}
```
由于传了回调,我们就要修改 Observer 观察者了
```
function Observer(options) {
    let {name, vm, key, callback} = options;
    this.subjects = {};
    this.name = name;
    this.vm = vm;
    this.key = key;
    this.oldValue = this.getValue();
    this.callback = callback;
}
Observer.prototype.update = function() {
    console.log(`'${this.name}' 执行 update 函数`);
    let oldValue = this.oldValue;
    let newValue = this.getValue();
    if (oldValue !== newValue) { // 如果数据变化了
        this.oldValue = newValue; // 更新 observer 里面保存的 oldValue
        this.callback.call(this, newValue, oldValue); // 调用回调更新模板数据
    }
}
```
这个时候问题就来了,现在我们为每个可能变化的数据都绑定了一个观察者,现在我们唯一没有做的事情就是这么多观察者,什么时候该订阅主题呢?我们知道是需要在 `on` 这个监听数据变化的函数里面订阅,可是问题来了,谁来订阅?难道你需要每个观察者都过来订阅嘛?显然不是,因为这样就有一堆观察者绑定了一堆主题,请注意我们这里的**一对多关系**,只有变化的主题(`this.data.name`)我们才去订阅它.我们这个时候想到,要是哪个数据有变化,这个时候绑定这个数据的观察者就站出来,也就是说目前**绑定的这个观察者的优先级最高**,它能优先更新这个数据就好了,那么怎么做呢?

于是我们想到可不可以用一个全局的 `globleObserver` 来做呢?首先我们假定这个全局的,优先级最高的观察者为 null, 当它不为 null 时,就可以订阅了,那么在哪里订阅?当然是在 `get` 函数中
```
var globleObserver = null;
function on(data) {
    ...
    get: ()=> {
        if (globleObserver) {
            globleObserver.subscribe(subject); // 订阅
        }
        return value;
    }
    set: (newValue)=> {
        console.log(`change value from '${value}' to '${newValue}'`);
        value = newValue;
        // 值发生改变时通知 observer
        subject.emit();
    }
}
```
然后在观察者里添加个 `getValue` 函数
```
Observer.prototype.getValue = function() {
    globleObserver = this; // 下面的语句在执行时会触发 getter, 
                           // 在 getter return 之前将监听数据的 observer 添加进 subject 数据里面
    let value = this.vm.$data[this.key]; // 触发 getter
    globleObserver = null;  // 将 globleObserver 置 null, 为下个 observer 做准备
                            // 此时 subject 里面已经有了该 observer
    return value;
}
```
最后修改一下 Observer 对象
```
function Observer(options) {
    let {name, vm, key, callback} = options;
    this.subjects = {};
    this.name = name;
    this.vm = vm;
    this.key = key;
    this.oldValue = this.getValue();
    this.callback = callback;
}
```
这样就好了,我在一开始 new Observer 对象时就会去保存一个旧值,调用了 `getValue` 函数,在这个函数中,先将自己的权限设置成最高,然后通过赋值操作触发 `getter`,由于此时 `globelObserver` 不为 null 了, 在 `getter` 中当前 Observer 就订阅了主题,此时再将这个 globelObserver 置 null 将权限下放,为下个 new Observer 做准备,完美解决以上问题!

## 双向绑定
上面的是实现了单向的绑定,可是一个 MVVM 是要双向的阿,那么怎么实现呢?这里我们就要学习 Vue 的方法了,也许你已经猜到了,对,就是**指令**,我们先定义一个 `v-model` 指令吧, `v-model="name"` 就表示绑定的是一个变量,这个变量的名字就是 name

我们需要修改 Compiler 的 parse 函数
```
Compiler.prototype.parse = function(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        this.parseNodeAttribute(node); // 解析指令,属性
        node.childNodes.forEach(childNode => {
            this.parse(childNode);
        });
    } else if (node.nodeType === Node.TEXT_NODE) {
        this.render2Text(node);
    }
}
```
多了个 `parseNodeAttribute`,我们看看它实现了什么
```
Compiler.prototype.parseNodeAttribute = function(node) {
    let attributes = [...node.attributes];
    attributes.forEach(attribute=> {
        let directive = attribute.name; // "v-model"
        if (this.isModelDirective(directive)) {
            this.bindModel(attribute, node);
        }
    });
}
```
恩就是把属性一个个抽出来解析嘛,很简单阿,再看
```
Compiler.prototype.isModelDirective = function(directive) {
    return ['v-model'].includes(directive);
}
Compiler.prototype.bindModel = function(attribute, node) {
    let bindKey = attribute.value; // "name"
    /* --- 双向绑定区域 --- */
    // 当 input 值发生变化时，对应的 data 项的值也发生变化
    node.oninput = (e) => {
        this.vm.$data[bindKey] = e.target.value;
    }
    // 当对应的 data 项的值发生变化时， input 的值也发生变化
    node.value = this.vm.$data[bindKey];

    // 当对应的 data 项的数据再次发生变化时，需要再次渲染模板, 将旧数据替换成新数据
    this.listenDataChange({
        vm: this.vm,
        key: bindKey,
        callback: (newValue) => {
            node.value = newValue;
        }
    });
    /* --- 双向绑定区域 --- */
}
```
关键的地方来了,我们判断完指令后,就要绑定 model,这里需要说明的是,一般我们绑定的数据都是输入的,所以这里的双向绑定是对于**表单元素**而言的,通过监听 input 事件,我们可以做到更新 data,然后通过 data,自然也可以更新表单里面的值,最后不要忘了,当对应的 data 项的数据再次发生变化时，需要再次渲染模板, 将旧数据替换成新数据

## 增加个 v-on 指令
简单,继续在 `parseNodeAttribute` 函数里面做判断嘛
```
Compiler.prototype.parseNodeAttribute = function(node) {
    ...
        if (this.isModelDirective(directive)) {
            ...
        } else if (this.isEventDirective(directive)) { // "v-on"
            this.bindEventHandle(directive, attribute, node);
        }
    ...
}
Compiler.prototype.isEventDirective = function(directive) {
    return directive.indexOf('v-on') === 0;
}
Compiler.prototype.bindEventHandle = function(directive, attribute, node) {
    let eventType = directive.substr(5); // "click"
    let methodsName = attribute.value;   // "clikcMe"
    node.addEventListener(eventType, this.vm.$methods[methodsName].bind(this.vm));
}
```
利用 `addEventListener` 这个 api 可以轻松做到,最后需要注意的是需要 `bind(this.vm)`

然后就是在 Mvvm 这个对象的 `init` 方法里面添加 `methods` 属性,并且将 `$data` 中的数据直接代理到当前 vm 对象
```
Mvvm.prototype.init = function(options) {
    let {el, data, methods} = options;
    ...
    this.$methods = methods || {};

    // 当访问 vm.name 时相当于访问 vm.$data.name, 这里就需要用到 Object.defineProperty 数据劫持
    // 当访问 vm.talk() 时相当于访问 vm.$methods.talk()
    onInnerData(this);
}
```
增加个监听 vm 的函数吧
```
function onInnerData(vm) {
    // 遍历 data 属性
    let data = vm.$data;
    if (!data || typeof data !== 'object') { return; }
    for (let key in data) {
        Object.defineProperty(vm, key, {
            enumerable: true,
            configurable: true,
            get: ()=> { return data[key]; },
            set: (newValue)=> { data[key] = newValue; }
        });
    }

    // 遍历 methods 属性
    let methods = vm.$methods;
    if (!methods || typeof methods !== 'object') { return; }
    for (let key in methods) {
        Object.defineProperty(vm, key, {
            enumerable: true,
            configurable: true,
            get: ()=> { return methods[key].bind(vm); },
            set: (newValue)=> {
                console.log('set methods...');
            }
        });
    }
}
```
都是同样的逻辑,这样的话就可以用了,代码链接[在这儿](https://github.com/strugglebak/mvvm),预览链接[在这儿](https://strugglebak.github.io/mvvm/index)

## 总结
1. MVVM 是一种设计模式,用于分离 data 和 ui
2. Model 就是 data,一般用来 save data
3. View 是对 data 进行处理,比如渲染,比如格式化
4. ViewModel 就是个"保姆", Model 变了通知 View, View 变了通知 Model, 所有的行为逻辑都在 ViewModel 中

## 参考链接
[为何放弃MVC使用MVVM](https://www.jianshu.com/p/5bfdc5ba839a)

[MVVM基础之双向绑定原理](http://www.que01.top/2016/05/03/two-way-bind/)
