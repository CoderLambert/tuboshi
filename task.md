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
  suggestions: INaviAppSuggestionQuestionItem[]
}

// 问题详情
export type INaviAppSuggesQuestionItemDetail = {
  id: string
  content: string
}
// 建议问题类别
export type INavieAppSuggesQuestionCategory = string
// 分类配置详情
export type INaviAppSuggestionQuestionItem = Record<INavieAppSuggesQuestionCategory, INaviAppSuggesQuestionItemDetail[]>
```

## 功能迁移

### 已完成

1. markdown
   1. 代码块
   2. 链接
   3. 图片
   4. 列表
   5. 标题
   6. 引用
   7. 表格
   8. 水平线
   9. 思考

### 待完成

1. 语音
   1. 录制
   2. 转换文本  
   3. 取消转换

2. 消息会话
   1. feedback 反馈
   2. suggestion 建议
   3. question 问题
   4. answer 回答

### 语音转文字

1. 请求接口定义
POST
/audio-to-text
语音转文字
Request Body
该接口需使用 multipart/form-data 进行请求。

参数信息
Name  file  Type file
Description
语音文件。 支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB

Name user Type string
Description
用户标识，由开发者定义规则，需保证用户标识在应用内唯一。

Response
text (string) 输出文字

```bash
curl -X POST 'http://yl-alg-alg-dify-api:5001/v1/audio-to-text' \
--header 'Authorization: Bearer {api_key}' \
--form 'file=@localfile;type=audio/[mp3|mp4|mpeg|mpga|m4a|wav|webm]
```

1. app 配置
2. gpt 配置
3. 用户配置
4. 语言

```bash
curl 'https://localhost:3000/api/chat-messages' \
  -H 'Accept: */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -b 'session_id=28d9f81a-b36b-445e-931f-e22451233feb; sessionId=28d9f81a-b36b-445e-931f-e22451233feb; locale=en; app_id=164a30dd-52c1-4caa-903f-c4bd0a644ad5; api_url=https://ai-agent.jtexpress.ph/v1; api_key=app-mwyf82VneBotRkMoRqlSwbaj; user_id=4707011993; SERVERID=2949538bc4c91f7400cc361115332483|1756691725|1756691725; __next_hmr_refresh_hash__=706da354927d71cc7df8f8044709f23c633457081244afec' \
  -H 'Origin: https://localhost:3000' \
  -H 'Pragma: no-cache' \
  -H 'Referer: https://localhost:3000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1' \
  -H 'content-type: application/json' \
  --data-raw '{"inputs":{"token":"c7d83d37593d44d59d391da71a1e9469","app_version":"3.1.9.3","langType":"EN","app_platform":".outfield."},"query":"hi","conversation_id":"-1","response_mode":"streaming"}'
```

<form data-format="text"> // Default to text
  <label for="username">Username:</label>
  <input type="text" name="username" />
  <label for="hidden_input">Hidden input:</label>
  <input type="hidden" name="hidden_input" value="hidden_value" />
  <label for="password">Password:</label>
  <input type="password" name="password" />
  <label for="content">Content:</label>
  <textarea name="content"></textarea>
  <label for="date">Date:</label>
  <input type="date" name="date" />
  <label for="time">Time:</label>
  <input type="time" name="time" />
  <label for="datetime">Datetime:</label>
  <input type="datetime" name="datetime" />
  <label for="select">Select:</label>
  <input type="select" name="select" data-options='["hello","world"]'/>
  <input type="checkbox" name="check" data-tip="By checking this means you agreed"/>
  <button data-variant="primary">Login</button>
</form>

<button data-message="Hello Dify" data-variant="primary">Hello Dify</button>
