function Mvvm(options) {
    this.init(options);
    on(this.$data); // 监听数据变化
    new Compiler(this);
}
Mvvm.prototype.init = function(options) {
    let {el, data} = options;
    this.$el = document.querySelector(el);
    this.$data = data;
}