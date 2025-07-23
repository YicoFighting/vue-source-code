import { isObject } from "@vue/shared";
import { track, trigger } from "./reactiveEffect";
import { reactive } from "./reactive";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutbaleHandlers: ProxyHandler<any> = {
  // 依赖收集
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    // 收集对象上的属性 key，和 effect 关联
    track(target, key);

    let res = Reflect.get(target, key, receiver);

    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  },
  // 触发更新
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      // 触发更新
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
