// 观察者
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
        this.callback.call(this, oldValue, newValue); // 调用回调更新模板数据
    }
}
Observer.prototype.getValue = function() {
    globleObserver = this; // 下面的语句在执行时会触发 getter, 
                           // 在 getter return 之前将监听数据的 observer 添加进 subject 数据里面
    let value = this.vm.$data[this.key]; // 触发 getter
    globleObserver = null;  // 将 globleObserver 置 null, 为下个 observer 做准备
                            // 此时 subject 里面已经有了该 observer
    return value;
}
Observer.prototype.subscribe = function(subject) {
    if (!this.subjects[subject.id]) {
        subject.addObserver(this);
        this.subjects[subject.id] = subject;
        console.log(`'${this.name}' 订阅了 '${subject.name}'`);
    }
}