# 会话管理系统使用指南

## 概述

本项目中有两套并存的会话管理系统，这是由于项目演进过程中架构升级所产生的。了解两套系统的差异和适用场景，有助于正确选择和使用，避免潜在问题。

### 为什么会有两套系统？

- **旧系统 (`use-conversation.ts`)**：早期的会话管理实现，提供基础的会话操作功能
- **新系统 (`useConversationManager.ts`)**：基于旧系统封装的高级管理器，提供更完整的功能和更好的用户体验

### 当前状态

- 旧系统仍在广泛使用，特别是在核心业务组件中
- 新系统适用于新的功能和需要高级特性的场景
- **两套系统可以并存**，但在同一组件中建议只使用其中一套

---

## 旧系统：use-conversation.ts

### 基本介绍

位置：`src/hooks/use-conversation.ts`

提供基础的会话状态管理和操作方法，是项目的核心会话管理Hook。

### API 文档

#### 返回值类型

```typescript
interface UseConversationReturn {
  // 状态管理
  conversationList: IConversationItem[]
  currConversationId: string
  isNewConversation: boolean

  // 会话信息
  currInputs: Record<string, any> | null
  currConversationInfo: ConversationInfoType | null

  // 操作方法
  switchToConversation: (conversationId: unknown, appId: unknown) => void
  createNewConversation: (appId: unknown) => void
  deleteConversationFromList: (conversationId: string) => void
  renameConversationInList: (conversationId: unknown, newName: unknown) => void

  // 设置方法
  setConversationList: React.Dispatch<React.SetStateAction<IConversationItem[]>>
  setCurrConversationId: (id: unknown, appId: unknown, isSetToLocalStroge?: boolean, _newConversationName?: string) => void

  // 事件发射
  emitCreateConversation: () => void
  emitToggleHistoryConversation: () => void

  // 其他方法...
}
```

#### 使用示例

```typescript
import useConversation from '@/hooks/use-conversation'

function MyComponent() {
  const {
    conversationList,
    currConversationId,
    switchToConversation,
    createNewConversation,
    deleteConversationFromList,
    isNewConversation
  } = useConversation()

  const handleSelectConversation = (id: string) => {
    // ⚠️ 注意：appId 在某些场景下可能为空字符串
    switchToConversation(id, 'your-app-id')
  }

  const handleCreateNew = () => {
    createNewConversation('your-app-id')
  }

  const handleDelete = (id: string) => {
    deleteConversationFromList(id)
  }

  return (
    <div>
      {conversationList.map(conv => (
        <div key={conv.id}>
          <h3>{conv.name}</h3>
          <button onClick={() => handleSelectConversation(conv.id)}>
            选择
          </button>
          <button onClick={() => handleDelete(conv.id)}>
            删除
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 优势

1. **简单直接**：API简洁，学习成本低
2. **灵活性高**：可以精细控制每个操作
3. **依赖少**：不需要复杂的配置
4. **稳定可靠**：经过长期使用验证

### 局限性

1. **appId 处理不完善**：在某些方法中硬编码为空字符串
2. **缺少UI状态管理**：需要手动处理加载状态、切换动画等
3. **错误处理分散**：需要自行处理各种异常情况
4. **功能不完整**：缺少一些高级功能如历史消息自动加载

### 已知问题和解决方案

#### 问题 1：删除会话时 appId 为空

```typescript
// 问题代码
deleteConversationFromList = (conversationId: string) => {
  if (conversationId === currConversationId) {
    const remainingConversations = conversationList.filter(conv => conv.id !== conversationId)
    if (remainingConversations.length > 0) {
      switchToConversation(remainingConversations[0].id, '') // ❌ appId 为空
    } else {
      createNewConversation('') // ❌ appId 为空
    }
  }
}
```

**解决方案**：已通过修改 `AppIdSchema` 允许空字符串，但这只是临时方案。更好的做法是确保正确传递 appId。

#### 问题 2：会话切换时缺少状态管理

需要在组件中自行管理切换状态：

```typescript
const [isSwitching, setIsSwitching] = useState(false)

const handleSwitch = async (id: string) => {
  setIsSwitching(true)
  try {
    switchToConversation(id, appId)
  } finally {
    setIsSwitching(false)
  }
}
```

---

## 新系统：useConversationManager.ts

### 基本介绍

位置：`src/hooks/useConversationManager.ts`

基于旧系统封装的高级会话管理器，提供更完整的功能和更好的用户体验。

### 配置要求

```typescript
interface ConversationManagerConfig {
  // 基础配置
  appId: string
  inited: boolean
  isResponding: boolean

  // UI状态设置
  setChatList: (list: ChatItem[]) => void
  setHistoryMessages: (messages: any[]) => void
  setShowLoadHistoryButton: (show: boolean) => void
  setHasMoreHistory: (hasMore: boolean) => void
  setSuggestQuestionsAfterAnswer: (questions: string[]) => void
  setIsSwitchingConversation: (isSwitching: boolean) => void

  // 会话信息设置
  setExistConversationInfo: (info: ConversationInfoType) => void
  setNewConversationInfo: (info: ConversationInfoType) => void
  setCurrInputs: (inputs: Record<string, any>) => void
  resetNewConversationInputs: () => void

  // 其他设置
  setAppUnavailable: (unavailable: boolean) => void
  setIsUnknownReason: (unknown: boolean) => void
  setInited: (inited: boolean) => void
  setPromptConfig: (config: any) => void
  setVisionConfig: (config: any) => void
  setConversationList: (list: IConversationItem[]) => void
  setCurrConversationId: (id: string) => void
}
```

#### 使用示例

```typescript
import useConversationManager from '@/hooks/useConversationManager'

function MyAdvancedComponent() {
  // 需要提供完整的配置
  const manager = useConversationManager({
    appId: 'your-app-id',
    inited: true,
    isResponding: false,
    setChatList: setChatList,
    setHistoryMessages: setHistoryMessages,
    setShowLoadHistoryButton: setShowLoadHistoryButton,
    setHasMoreHistory: setHasMoreHistory,
    setSuggestQuestionsAfterAnswer: setSuggestQuestionsAfterAnswer,
    setIsSwitchingConversation: setIsSwitchingConversation,
    setExistConversationInfo: setExistConversationInfo,
    setNewConversationInfo: setNewConversationInfo,
    setCurrInputs: setCurrInputs,
    resetNewConversationInputs: resetNewConversationInputs,
    setAppUnavailable: setAppUnavailable,
    setIsUnknownReason: setIsUnknownReason,
    setInited: setInited,
    setPromptConfig: setPromptConfig,
    setVisionConfig: setVisionConfig,
    setConversationList: setConversationList,
    setCurrConversationId: setCurrConversationId,
  })

  const {
    conversationList,
    currConversationId,
    showConversationList,
    handleConversationSelect,
    handleNewConversation,
    isSwitchingConversation
  } = manager

  return (
    <div>
      {/* UI状态已自动管理 */}
      {isSwitchingConversation && <div>切换中...</div>}

      {conversationList.map(conv => (
        <div key={conv.id}>
          <h3>{conv.name}</h3>
          <button
            onClick={() => handleConversationSelect(conv.id)}
            disabled={isSwitchingConversation}
          >
            选择
          </button>
        </div>
      ))}

      <button onClick={handleNewConversation}>
        新建会话
      </button>
    </div>
  )
}
```

### 优势

1. **功能完整**：包含所有必要的会话管理功能
2. **状态管理**：自动处理UI状态（加载、切换、错误等）
3. **错误处理**：集成化的错误处理和Toast通知
4. **用户体验**：更好的切换动画和状态反馈
5. **历史消息**：自动处理历史消息加载

### 局限性

1. **复杂度高**：需要13个配置回调函数
2. **学习成本**：API复杂，需要时间理解
3. **过度设计**：对于简单场景可能过于复杂
4. **调试困难**：错误可能分散在多个回调中

### 配置注意事项

#### 必须正确配置的回调

```typescript
// ❌ 错误：空回调会导致功能异常
const manager = useConversationManager({
  setChatList: () => {}, // 空实现
  // ... 其他空实现
})

// ✅ 正确：提供实际的实现
const manager = useConversationManager({
  setChatList: (list) => setChatList(list),
  setHistoryMessages: (messages) => setHistoryMessages(messages),
  // ... 提供所有必要的实现
})
```

#### 配置验证

建议在开发时添加配置验证：

```typescript
const config = {
  appId,
  inited,
  isResponding,
  setChatList,
  setHistoryMessages,
  // ... 其他配置
}

// 验证必要配置
const requiredCallbacks = [
  'setChatList', 'setHistoryMessages', 'setConversationList', 'setCurrConversationId'
]

requiredCallbacks.forEach(key => {
  if (!config[key] || typeof config[key] !== 'function') {
    throw new Error(`Missing required callback: ${key}`)
  }
})

const manager = useConversationManager(config)
```

---

## 系统对比分析

### 功能对比表

| 功能特性 | 旧系统 | 新系统 |
|---------|--------|--------|
| 基础会话管理 | ✅ | ✅ |
| 会话切换 | ✅ | ✅ (自动状态管理) |
| 会话创建 | ✅ | ✅ (自动状态管理) |
| 会话删除 | ✅ | ✅ (自动状态管理) |
| 会话重命名 | ✅ | ✅ (自动状态管理) |
| UI状态管理 | ❌ (需手动) | ✅ (自动) |
| 错误处理 | ❌ (需手动) | ✅ (集成) |
| 历史消息加载 | ❌ | ✅ |
| Toast通知 | ❌ (需手动) | ✅ (自动) |
| 配置复杂度 | 🟢 简单 | 🔴 复杂 |
| 学习成本 | 🟢 低 | 🔴 高 |
| 代码复用性 | 🟢 高 | 🟡 中等 |

### 性能对比

- **旧系统**：性能较好，功能单一，开销小
- **新系统**：功能完整，但有一定的额外开销

### 复杂度对比

- **旧系统**：简单直接，但需要手动处理很多细节
- **新系统**：开箱即用，但配置复杂

---

## 使用指南

### 如何选择使用哪个系统

#### 使用旧系统的情况

1. **简单组件**：只需要基础会话操作
2. **自定义UI**：需要完全控制UI状态
3. **性能敏感**：对性能要求较高
4. **学习成本**：团队熟悉旧系统，不想引入新复杂性

#### 使用新系统的情况

1. **复杂组件**：需要完整的会话管理功能
2. **新功能开发**：从头开始开发新功能
3. **用户体验**：需要更好的状态反馈和错误处理
4. **快速开发**：希望开箱即用，减少样板代码

### 迁移建议

#### 渐进式迁移（推荐）

```typescript
// 阶段1：保持现有代码
const oldHook = useConversation()

// 阶段2：新功能使用新系统
const newManager = useConversationManager(config)

// 阶段3：逐步替换旧代码
// 当需要重构旧组件时，考虑迁移到新系统
```

#### 不推荐的直接迁移

```typescript
// ❌ 不推荐：直接大规模替换
// 风险高，容易引入问题
```

### 混合使用注意事项

如果需要在同一个应用中使用两套系统：

1. **组件隔离**：确保每个组件只使用一套系统
2. **状态同步**：注意保持会话状态的一致性
3. **避免冲突**：不要在同一个组件中混用两套API

```typescript
// ❌ 避免：在同一个组件中混用
function BadExample() {
  const oldHook = useConversation()
  const newManager = useConversationManager(config)

  // 混用会导致状态不一致
  return (
    <div>
      <button onClick={() => oldHook.createNewConversation(appId)}>
        旧系统创建
      </button>
      <button onClick={() => newManager.handleNewConversation()}>
        新系统创建
      </button>
    </div>
  )
}

// ✅ 推荐：组件隔离
function OldComponent() {
  const hook = useConversation()
  // 只使用旧系统API
}

function NewComponent() {
  const manager = useConversationManager(config)
  // 只使用新系统API
}
```

---

## 最佳实践

### 开发建议

#### 1. 统一团队规范

```typescript
// 项目配置文件
export const CONVERSATION_SYSTEM = 'legacy' // 'legacy' | 'modern'

// 在项目中统一使用
if (CONVERSATION_SYSTEM === 'legacy') {
  const hook = useConversation()
} else {
  const manager = useConversationManager(config)
}
```

#### 2. 创建封装层

```typescript
// src/hooks/useConversationUnified.ts
export function useConversationUnified(options = {}) {
  if (options.useModern) {
    return useConversationManager(options.config)
  } else {
    return useConversation()
  }
}

// 使用
const conversation = useConversationUnified({
  useModern: isModernComponent,
  config: modernConfig
})
```

#### 3. 错误边界处理

```typescript
// 为新系统添加错误边界
function ConversationManagerWrapper({ children, config }) {
  try {
    return children(useConversationManager(config))
  } catch (error) {
    console.error('Conversation manager config error:', error)
    // 降级到旧系统
    return children(useConversation())
  }
}
```

### 避坑指南

#### 1. appId 处理

```typescript
// ❌ 避免：硬编码空字符串
switchToConversation(id, '')

// ✅ 推荐：正确传递appId
switchToConversation(id, appId || '')

// ✅ 更好：使用验证函数
const safeAppId = validateAppId(appId)
switchToConversation(id, safeAppId)
```

#### 2. 异步操作处理

```typescript
// ❌ 避免：忽略异步状态
const handleSwitch = (id) => {
  switchToConversation(id, appId)
  // 立即执行后续操作可能导致问题
  setIsSwitching(false)
}

// ✅ 推荐：正确处理异步状态
const handleSwitch = async (id) => {
  setIsSwitching(true)
  try {
    await switchToConversation(id, appId)
  } finally {
    setIsSwitching(false)
  }
}
```

#### 3. 内存泄漏预防

```typescript
// ✅ 推荐：清理副作用
useEffect(() => {
  const cleanup = () => {
    // 清理订阅、定时器等
  }

  return cleanup
}, [])
```

### 性能优化建议

#### 1. 避免不必要的重渲染

```typescript
// ✅ 推荐：使用memo和callback
const MemoizedComponent = memo(function({ conversationId }) {
  const handleSelect = useCallback((id) => {
    switchToConversation(id, appId)
  }, [appId])

  return <button onClick={() => handleSelect(conversationId)}>选择</button>
})
```

#### 2. 大列表优化

```typescript
// ✅ 推荐：虚拟滚动或分页
const ConversationList = ({ conversations }) => {
  return (
    <VirtualizedList
      height={400}
      itemCount={conversations.length}
      itemSize={60}
      renderItem={({ index }) => (
        <ConversationItem conversation={conversations[index]} />
      )}
    />
  )
}
```

#### 3. 状态选择优化

```typescript
// ✅ 推荐：只订阅需要的状态
const { currConversationId, switchToConversation } = useConversation()
// 而不是获取所有返回值
```

---

## 常见问题解答

### Q1: 为什么删除会话时会有 appId 为空的错误？

**A**: 这是旧系统中的一个已知问题。在 `deleteConversationFromList` 方法中，切换到其他会话或创建新会话时硬编码了空字符串作为 appId。已经通过修改 `AppIdSchema` 允许空字符串来临时解决。

**长期解决方案**：重构删除逻辑，正确获取和传递 appId。

### Q2: 新系统需要13个配置项，太多了，有简化方案吗？

**A**: 可以考虑以下方案：

1. **创建配置工厂函数**：
```typescript
function createConversationConfig(appId, setters) {
  return {
    appId,
    inited: true,
    isResponding: false,
    ...setters
  }
}

const config = createConversationConfig(appId, {
  setChatList,
  setHistoryMessages,
  // 只需要传递必要的setter
})
```

2. **使用默认配置**：
```typescript
const defaultConfig = {
  inited: true,
  isResponding: false,
  setAppUnavailable: () => {},
  setIsUnknownReason: () => {},
  // 提供默认实现
}

const config = { ...defaultConfig, ...customConfig }
```

### Q3: 可以在同一个组件中使用两套系统吗？

**A**: 不推荐。虽然技术上可行，但会导致状态不一致、调试困难等问题。建议：

1. **组件级别隔离**：不同组件使用不同系统
2. **统一选择**：在项目层面统一使用一套系统
3. **渐进迁移**：逐步替换，避免混用

### Q4: 新系统的性能如何？

**A**: 新系统有一定性能开销，主要体现在：

1. **额外的状态管理**
2. **更多的回调函数**
3. **自动化的副作用处理**

但在大多数场景下，这些开销是可以接受的。如果对性能有极高要求，可以使用旧系统或进行性能优化。

### Q5: 如何处理会话切换时的异常？

**A**: 推荐的模式：

```typescript
const handleSwitch = async (conversationId) => {
  setIsSwitching(true)
  try {
    await switchToConversation(conversationId, appId)
    Toast.notify({ type: 'success', message: '切换成功' })
  } catch (error) {
    console.error('切换失败:', error)
    Toast.notify({ type: 'error', message: '切换失败，请重试' })
  } finally {
    setIsSwitching(false)
  }
}
```

---

## 总结

两套会话管理系统各有优势，选择合适的系统需要考虑：

1. **功能需求**：是否需要完整的UI状态管理
2. **开发复杂度**：团队对新系统的接受程度
3. **性能要求**：是否对性能有特殊要求
4. **维护成本**：长期的维护和扩展考虑

**推荐策略**：
- 保持现状，两套系统并存
- 新功能优先使用新系统
- 旧功能保持稳定，渐进式优化
- 在合适的时机进行统一重构

通过合理的使用，两套系统可以很好地协同工作，为项目提供稳定可靠的基础支持。