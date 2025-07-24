export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export enum DirtyLevels {
  Dirty = 4, // 脏值，取值时要进行计算
  NoDirty = 0,
}
