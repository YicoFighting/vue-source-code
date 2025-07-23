import { activeEffect, trackEffect, triggerEffects } from "./effect";
const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep = new Map() as any;
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
};

// 依赖收集
export function track(target, key) {
  if (activeEffect) {
    let despMap = targetMap.get(target);
    if (!despMap) {
      despMap = new Map();
      targetMap.set(target, despMap);
    }
    let dep = despMap.get(key);
    if (!dep) {
      // 用于清理不需要的属性
      despMap.set(key, (dep = createDep(() => despMap.delete(key), key)));
    }
    trackEffect(activeEffect, dep);
  }
}

// 触发更新
export function trigger(target, key, value, oldValue) {
  const despMap = targetMap.get(target);
  if (!despMap) return;
  const dep = despMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
