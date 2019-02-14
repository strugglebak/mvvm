function Mvvm(options) {
    this.init(options);
    this.number = parseInt(Math.random()*1000, 10);
    on(this.$data); // 监听数据变化
    this.compile();
}
Mvvm.prototype.init = function(options) {
    let {el, data} = options;
    this.$el = document.querySelector(el);
    this.$data = data;
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
        let key = match[1].trim();  // "name"
        let value = match[0];       // "{{name}}"
        node.nodeValue = node.nodeValue.replace(value, this.$data[key]);
        // 当数据发生变化时，需要再次渲染模板, 将旧数据替换成新数据
        let number = parseInt(Math.random()*1000, 10);
        while(this.number === number) {
            number = parseInt(Math.random()*1000, 10);
        }
        let options = {
            name: 'observer-'+ number + '号',
            vm: this,
            key: key,
            callback: (oldValue, newValue)=> {
                node.nodeValue = node.nodeValue.replace(oldValue, newValue);
            },
        }
        // 为每个变化的数据添加 observer
        new Observer(options);
    }
}