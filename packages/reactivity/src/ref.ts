import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

function createRef(value) {
  return new RefImpl(value);
}

export function ref(value) {
  return createRef(value);
}

class RefImpl {
  public __v_isRef = true; // 增加 ref 标识
  public _value; // 用于保存 ref 的值
  public dep; // 用于收集对应的 effect

  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), "undefined"))
    );
  }
}
function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) {
    triggerEffects(dep);
  }
}

class ObjectRefImpl {
  public __v_isRef = true;

  constructor(public _object, public _key) {}

  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  const ret = {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      // 原来的值是 ObjectRefImpl 构建出来的 ref 对象，所以需要设置 .value = xxx
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        // 简单属性赋值
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
