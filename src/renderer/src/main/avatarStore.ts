import { type Store, createStore } from "./lib/store";

export type avatar = {
  path: string;
  mirror: boolean;
  animation: string;
};

export const avatarStore: Store<avatar | undefined> = createStore(undefined);
