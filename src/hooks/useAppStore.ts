import { create } from "zustand";

const useAppStore = create((set) => ({
  appRequestHeader: {},
  setAppRequestHeader: (appRequestHeader: {
    [key: string]: string | number | boolean;
  }) => set({ appRequestHeader }),
  userInfo: {},
  setUserInfo: (userInfo: { [key: string]: string | number | boolean }) =>
    set({ userInfo }),
  GPTConfig: {},
  setGPTConfig: (GPTConfig: {
    app_key: string;
    app_id: string;
    api_url: string;
  }) => set({ GPTConfig }),
  statusBarHeight: {},
  setStatusBarHeight: (statusBarHeight: {top: string, bottom: string}) => set({ statusBarHeight }),
}));

export default useAppStore;
