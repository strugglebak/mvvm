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
        this.parseNodeAttribute(node);
        node.childNodes.forEach(childNode => {
            this.parse(childNode);
        });
    } else if (node.nodeType === Node.TEXT_NODE) {
        this.render2Text(node);
    }
}
Mvvm.prototype.parseNodeAttribute = function(node) {
    let attributes = [...node.attributes];
    attributes.forEach(attribute=> {
        let directive = attribute.name; // "v-model"
        if (this.isDirective(directive)) {
            let bindKey = attribute.value; // "name"
            /* --- 双向绑定区域 --- */
            // 当 input 值发生变化时，对应的 data 项的值也发生变化
            node.oninput = (e)=> {
                this.$data[bindKey] = e.target.value;
            }
            // 当对应的 data 项的值发生变化时， input 的值也发生变化
            node.value = this.$data[bindKey];

            // 当对应的 data 项的数据再次发生变化时，需要再次渲染模板, 将旧数据替换成新数据
            this.listenDataChange({
                vm: this,
                key: bindKey,
                callback: (newValue)=> {
                    node.value = newValue;
                }
            });
            /* --- 双向绑定区域 --- */
        }
    });
}
Mvvm.prototype.isDirective = function(directive) {
    return ['v-model'].includes(directive);
}
Mvvm.prototype.render2Text = function(node) {
    let regex = /{{(.+?)}}/g; // 正则，匹配 {{}} 字符串
    let match;
    while (match = regex.exec(node.nodeValue)) {
        let key = match[1].trim();  // "name"
        let value = match[0];       // "{{name}}"
        node.nodeValue = node.nodeValue.replace(value, this.$data[key]);

        // 当对应的 data 项的数据再次发生变化时，需要再次渲染模板, 将旧数据替换成新数据
        this.listenDataChange({
            vm: this,
            key: key,
            callback: (newValue, oldValue)=> {
                node.nodeValue = node.nodeValue.replace(oldValue, newValue);
            },
        });
    }
}
Mvvm.prototype.listenDataChange = function(options) {
    let number = parseInt(Math.random()*1000, 10);
    while(this.number === number) {
        number = parseInt(Math.random()*1000, 10);
    }
    let name = 'observer-'+ number + '号';
    let optionsCopy = options;
    optionsCopy.name = name;
    // 为每个变化的数据添加 observer
    new Observer(optionsCopy);
}