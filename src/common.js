// 公共函数
// 监听 data 是否被 get 或 set
var globleObserver = null;

function on(data) {
    if (!data || typeof data !== 'object') { return; }
    for (let key in data) {
        let value = data[key];
        let subject = new Subject('subject-' + parseInt(Math.random()*1000) + '号主题');
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: ()=> {
                console.log(`get value is '${value}'`);
                if (globleObserver) {
                    console.log(`当前 observer 是 '${globleObserver.name}'`);
                    globleObserver.subscribe(subject);
                }
                return value;
            },
            set: (newValue)=> {
                console.log(`change value from '${value}' to '${newValue}'`);
                value = newValue;
                // 值发生改变时通知 observer
                subject.emit();
            }
        });
        if (typeof value === 'object') {
            observe(value);
        }
    }
}