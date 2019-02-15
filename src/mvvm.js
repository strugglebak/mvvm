function Mvvm(options) {
    this.init(options);
    on(this.$data); // 监听数据变化
    new Compiler(this).compile();
}
Mvvm.prototype.init = function(options) {
    let {el, data, methods} = options;
    this.$el = document.querySelector(el);
    this.$data = data;
    this.$methods = methods;

    // 当访问 vm.name 时相当于访问 vm.$data.name, 这里就需要用到 Object.defineProperty 数据劫持
    // 当访问 vm.talk() 时相当于访问 vm.$methods.talk()
    onInnerData(this);
}