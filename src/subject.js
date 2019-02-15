// 主题
function Subject(name='') {
    this.name = name;
    this.id = subjectId++;
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