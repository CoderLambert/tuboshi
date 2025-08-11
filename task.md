# 任务记录

## 大模型侧 App 启动所需参数

1. app_key   string 类型    由大模型平台应用详情 `访问Api` 页面获取

2. app_id    string 类型    由大模型平台应用详情 `路由参数` 获取

3. api_url   string 类型    后端接口地址，由大模型平台应用详情 `访问Api` 页面 `API 服务器` 获取

4. app_info  Object 类型  由业务端自定义。 
    主要内容有： 1. 应用标题  2. 应用描述 3. 默认语言 (当前应该只需要支持 en ) 

5. current_conversation_id  当前会话 id， 同步最后退出时的会话状态

6. first_id    当前会话，最后展示的消息内容中的 第一条消息id， 用于还原会话状态或者查询历史会话消息的参数

```ts

// 大模型平台 App 信息配置， 需要 jsBridge 返回
export const APP_INFO: AppInfo   = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'zh-Hans',
}


export interface IAPPConfig  {
  app_info: AppInfo
  app_key: string 
  app_id: string
  api_url: string

  // last_conversation_id 和 first_id 如果前端可以直接本地存储，长久化保持，可以由前端生成
  // 否则需要 jsBridge 调用app进行存储，在下次打开 app 时传回进行初始化配置, 建议直接app提供存储，方便后续存在多轮历史对话管理
  last_conversation_id: string | null  // 为 null 代表是新会话  存在值的话需要凭借这个 id 获取历史会话消息
  first_id: string | null           // 默认为 null， 当存在会话消息存在的时候，为当前会话记录第一条消息， 用于向上拉取历史会话消息

  // 如果之后需要做会话管理，则需要再添加, 会话管理初始化配置
  // current_conversation: string | null
  // conversations: []
}
```

## 原生 APP 传递参数配置 

1. token 用于传递接口鉴权信息，通过APP传递大模型平台进行接口调用

2. user 用户id, 用于大模型平台侧进行用户身份区分

3. suggestions 问题推荐列表配置. 示例: 

```json
[
    {
        "收派": [
            "联系不上客户怎么办？",
            "打火机可以寄吗？",
            "包装破损了怎么办？"
        ]
    }, 
    {
        "数据统计": [
            ...
        ]
    }
    ...
]
```
```ts
// 业务 app 配置
export const NavieAppConfig: INaviAppConfig = {
  token: '',
  user: '',
  suggestions: []
}

// 原生 APP 配置项  jsBridge  获取，  user 用于唯一区分会话， suggestions 问题推荐列表
export type INaviAppConfig = {
  token: string
  user: string
  suggestions: INavieAppSuggesQuestionItem[]
}

// 问题详情
export type INaviAppSuggesQuestionItemDetail = {
  id: string
  content: string
}
// 建议问题类别
export type INavieAppSuggesQuestionCategory = string
// 分类配置详情
export type INavieAppSuggesQuestionItem = Record<INavieAppSuggesQuestionCategory, INaviAppSuggesQuestionItemDetail[]>
```