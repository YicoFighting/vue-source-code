import { isObject } from "@vue/shared";
import { ReactiveFlags, mutbaleHandlers } from "./baseHandler";

// 缓存代理后的结果
const reactiveMap = new WeakMap();

function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }

  // 如果为 true，表示已经被代理过；直接返回即可
  if (target[ReactiveFlags.IS_REACTIVE]) return target;

  // 防止对象被重复代理
  const exitsProxy = reactiveMap.get(target);
  if (exitsProxy) return exitsProxy;

  const proxy = new Proxy(target, mutbaleHandlers);
  // 设置缓存
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}
