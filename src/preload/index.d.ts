export {};

declare global {
  interface Window {
    api: {
      getAppVersion: () => Promise<string>;
    };
  }
}
