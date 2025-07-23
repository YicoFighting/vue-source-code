const person = {
  name: "zh",
  get aliasName() {
    return this.name + "handsome";
  },
};

const proxyPerson = new Proxy(person, {
  // receiver 是代理对象
  get(target, key, receiver) {
    console.log(key); // 只打印了 aliasName
    // return target[key];
    // 等价与 receiver[key] 但不会死循环
    return Reflect.get(target, key, receiver);
  },
});

console.log(proxyPerson.aliasName);
