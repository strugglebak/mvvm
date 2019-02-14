// 观察者
function Observer(name='') {
    this.name = name;
}
Observer.prototype.update = function() {
    console.log(this.name + ' 执行 update 函数');
}
Observer.prototype.subscribe = function(subject) {
    subject.addObserver(this);
    console.log(`${this.name} 订阅了 ${subject.name}`);
}