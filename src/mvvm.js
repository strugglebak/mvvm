function Mvvm(options) {
    this.init(options);
    on(this.$data); // 监听数据变化
    new Compiler(this);
}
Mvvm.prototype.init = function(options) {
    let {el, data} = options;
    this.$el = document.querySelector(el);
    this.$data = data;

    // 当访问 vm.name 时相当于访问 vm.$data.name, 这里就需要用到 Object.defineProperty 数据劫持
    onInnerData(this);
}