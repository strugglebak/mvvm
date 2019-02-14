function Mvvm(options) {
    this.init(options);
    on(this.$data); // 监听数据变化
    this.compile();
}
Mvvm.prototype.init = function(options) {
    let {el, data} = options;
    this.$el = document.querySelector(el);
    this.$data = data;
    this.observers = [];
}
Mvvm.prototype.compile = function() {
    this.parse(this.$el); // 解析元素中出现的 {{ }}
}
Mvvm.prototype.parse = function(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(childNode => {
            this.parse(childNode);
        });
    } else if (node.nodeType === Node.TEXT_NODE) {
        this.render2Text(node);
    }
}
Mvvm.prototype.render2Text = function(node) {
    let regex = /{{(.+?)}}/g; // 正则，匹配 {{}} 字符串
    let match;
    while (match = regex.exec(node.nodeValue)) {
        let key = match[1].trim();
        let value = match[0];
        node.nodeValue = node.nodeValue.replace(value, this.$data[key]);
    }
}