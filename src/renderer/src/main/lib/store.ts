export type Store<Value> = {
  publish(value: Value): void;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): Value;
};

// useSyncExternalStore で使うためのストアを作成します。
// useSyncExternalStore(store.subscribe, store.getSnapshot)
export function createStore<Value>(initialValue: Value): Store<Value> {
  let currentValue: Value = initialValue;
  let listeners: (() => void)[] = [];
  return {
    publish(value: Value): void {
      currentValue = value;
      for (const listener of listeners) {
        listener();
      }
    },

    subscribe(onStoreChange: () => void): () => void {
      listeners = [...listeners, onStoreChange];
      return () => {
        listeners = listeners.filter((listener) => listener !== onStoreChange);
      };
    },

    getSnapshot(): Value {
      return currentValue;
    },
  };
}
