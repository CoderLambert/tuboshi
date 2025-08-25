import { create } from 'zustand'
type PrimitiveValue = string | number | boolean

export type QACategory = {
  questionCategory: string;
  qaItemList: QaItemList[];
}

export type QaItemList = {
  question: string;
  answer: string;
}
const useAppStore = create(set => ({
  appRequestHeader: {},
  setAppRequestHeader: (appRequestHeader: {
    [key: string]: PrimitiveValue;
  }) => set({ appRequestHeader }),
  userInfo: {},
  setUserInfo: (userInfo: { [key: string]: PrimitiveValue }) => set({ userInfo }),
  GPTConfig: {},
  setGPTConfig: (GPTConfig: {
    app_key: string;
    app_id: string;
    api_url: string;
  }) => set({ GPTConfig }),
  statusBarHeight: {},
  setStatusBarHeight: (statusBarHeight: { top: string, bottom: string }) => set({ statusBarHeight }),
  qaData: [],
  setQaData: (qaData: QACategory[]) => set({ qaData }),
  inputsForm: {},
  setInputsForm: (inputs: { [key: string]: PrimitiveValue }) => set({ inputs }),
  userID: {},
  setUserID: (userID: { [key: string]: PrimitiveValue }) => set({ userID }),
}))

export default useAppStore
