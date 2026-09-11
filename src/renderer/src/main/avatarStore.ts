import { type Store, createStore } from "./lib/store";

export type avatar = {
  path: string;
  mirror: boolean;
};

export const avatarStore: Store<avatar | undefined> = createStore(undefined);
