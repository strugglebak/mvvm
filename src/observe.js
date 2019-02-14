let data = {
  name: 'strugglebak',
  brothers: [1, 2, 3],
  parent: {
      dad: {
          name: 'baba',
          age: 100
      },
      mom: {
          name: 'mama',
          age: 90,
          brothers: [1, 2, 3]
      }
  }
};
observe(data);

// console.log(data.name);

// data.name = 'valley';
// data.brothers[0] = 4;
// console.log(data.brothers[0]);

data.parent.mom.brothers[0] = 4;

function observe(data) {
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