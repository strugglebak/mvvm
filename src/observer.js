// 观察者
function Observer(name) {
    this.name = name;
}
Observer.prototype.update = function() {
    console.log(this.name + ' 执行 update 函数');
}
Observer.prototype.subscribe = function(subject) {
    subject.addObserver(this);
    console.log(`${this.name} 订阅了 ${subject.name}`);
}
Observer.prototype.on = function(data) {
    if (!data || typeof data !== 'object') { return; }
    for (let key in data) {
        let value = data[key];
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