# jsBridge 需要配合新增方法和参数名称

## 原因

目前参数虽然在 jsBridge 提供方法中都可以获取，但是这些参数名称都需要二次调整，之后复用到其它 app 的时候，需要再次调整参数名称，H5 会与具体项目逻辑耦合，不太合理

## 解决方案

新增 jsBridge 方法：
    getInputsForm:   获取会话初始化参数配置，用于启动会话， 内容由 H5 根据应用初始化参数需求，提供给 app 端，不同项目，内容不同

    getUserID:   获取当前用户ID， 用于唯一区分对话，所有项目都需要提供一个唯一区分用户的ID

### 菲律宾小件员参数获取方式

getInputsForm

```json
    {
        "token": "",    // jsBridge 方法 getUserInfo 中的 token 字段
        "app_version": "",  // 当前 jsBridge  getAppRequestHeader  version 字段
        "langType": "",   // "当前 jsBridge  getAppRequestHeader lang   字段
        "app_platform": "" // "当前 jsBridge  getAppRequestHeader lang   字段
    }

```

getUserID：

```json
    {
        "user-id": ""  //区分会话  菲律宾小件员app 对应  getUserInfo   userCode 字段
    }
```

### 前端实现

```ts
  const useInputsFormConfig = () => {
    const setInputsForm = useAppStore(state => state.setInputsForm)
    const inputsFormConfig = useAppStore(state => state.GPTConfig)
    useEffect(() => {
      const getInputsFormInfo = async () => {
        const res = await callNativeMethod('getInputsForm', {})
        setInputsForm(res)
      }
      getInputsFormInfo()
    }, [])
    return inputsFormConfig
  }

  const useUserID = () => {
    const setUserID = useAppStore(state => state.setUserID)
    const userID = useAppStore(state => state.userID)
    useEffect(() => {
      const getInputsFormInfo = async () => {
        const res = await callNativeMethod('getUserID', {})
        setUserID(res)
      }
      getInputsFormInfo()
    }, [])
    return userID
  }
```

## qa Data 问题列表

```json
{
  "data" : [
    {
      "questionCategory": "category1",
      "qaItemList": [
        {
          "question": "question1",
          "answer": "answer1"
        },
           {
          "question": "question2",
          "answer": "answer2"
        },
        {
          "question": "question3",
          "answer": "answer3"
        }
      ]
    },
      {
      "questionCategory": "category2",
      "qaItemList": [
        {
          "question": "question-2-1",
          "answer": "answer-2-1"
        },
           {
          "question": "question-2-2",
          "answer": "answer-2-2"
        },
        {
          "question": "question-2-3",
          "answer": "answer-2-3"
        }
      ]
    },
         {
      "questionCategory": "category3",
      "qaItemList": [
        {
          "question": "question-3-1",
          "answer": "answer-3-1"
        },
           {
          "question": "question-3-2",
          "answer": "answer-3-2"
        },
        {
          "question": "question-3-3",
          "answer": "answer-3-3"
        }
      ]
    }
  ]
}
```
