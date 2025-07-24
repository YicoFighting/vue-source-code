import { DirtyLevels } from "./constants";

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export let activeEffect;

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++;
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depsLength;
  }
}

export class ReactiveEffect {
  _trackId = 0;
  deps = [];
  _depsLength = 0;
  _running = 0;
  _dirtyLevel = DirtyLevels.Dirty;
  public active = true;
  constructor(public fn, public scheduler?) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }

  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }

  run() {
    this._dirtyLevel = DirtyLevels.NoDirty;
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size == 0) {
    dep.cleanup();
  }
}

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
    const oldDep = effect.deps[effect._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect);
      }
      effect.deps[effect._depsLength++] = dep;
    } else {
      effect._depsLength++;
    }
  }
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty;
    }

    if (effect.scheduler) {
      if (!effect._running) {
        effect.scheduler();
      }
    }
  }
}
