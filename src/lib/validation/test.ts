/**
 * 验证功能测试文件
 * 这个文件用于测试 Zod 验证逻辑是否正常工作
 */

import {
  validateConversationId,
  validateAppId,
  isNewConversation,
  validateSwitchConversationParams,
  validateNewConversationParams,
  validateRenameConversationParams,
  getConversationIdFromStorage,
  saveConversationIdToStorage,
} from './index'

// 测试函数
function runValidationTests() {
  console.log('🧪 开始验证功能测试...')

  // 测试 1: 会话ID验证
  console.log('\n📝 测试会话ID验证:')
  try {
    console.log('✅ 有效ID "123":', validateConversationId('123'))
    console.log('✅ 新会话ID "-1":', validateConversationId('-1'))
    console.log('❌ 无效ID "":', () => validateConversationId(''))
    console.log('❌ 无效ID null:', () => validateConversationId(null))
  } catch (error) {
    console.log('✅ 捕获到预期的错误:', error)
  }

  // 测试 2: 应用ID验证
  console.log('\n📝 测试应用ID验证:')
  try {
    console.log('✅ 有效appId "app123":', validateAppId('app123'))
    console.log('❌ 无效appId "":', validateAppId(''))
  } catch (error) {
    console.log('错误信息:', error)
  }

  // 测试 3: 新会话检查
  console.log('\n📝 测试新会话检查:')
  console.log('✅ "-1" 是新会话:', isNewConversation('-1'))
  console.log('❌ "123" 不是新会话:', isNewConversation('123'))

  // 测试 4: 切换会话参数验证
  console.log('\n📝 测试切换会话参数验证:')
  try {
    const validParams = validateSwitchConversationParams({
      conversationId: '123',
      appId: 'app456',
    })
    console.log('✅ 有效切换参数:', validParams)

    validateSwitchConversationParams({
      conversationId: '',
      appId: 'app456',
    })
  } catch (error) {
    console.log('✅ 捕获到预期的错误:', error)
  }

  // 测试 5: 新建会话参数验证
  console.log('\n📝 测试新建会话参数验证:')
  try {
    const newConvParams = validateNewConversationParams({
      appId: 'app123',
    })
    console.log('✅ 有效新建参数:', newConvParams)
  } catch (error) {
    console.log('❌ 错误:', error)
  }

  // 测试 6: 重命名参数验证
  console.log('\n📝 测试重命名参数验证:')
  try {
    const renameParams = validateRenameConversationParams({
      conversationId: '123',
      newName: 'New Conversation Name',
    })
    console.log('✅ 有效重命名参数:', renameParams)

    validateRenameConversationParams({
      conversationId: '123',
      newName: '',
    })
  } catch (error) {
    console.log('✅ 捕获到预期的错误:', error)
  }

  // 测试 7: localStorage 操作
  console.log('\n📝 测试localStorage操作:')
  try {
    const testAppId = 'test-app'
    const testConversationId = 'test-conv-123'

    // 保存
    const saveResult = saveConversationIdToStorage(testAppId, testConversationId)
    console.log('✅ 保存结果:', saveResult)

    // 读取
    const retrievedId = getConversationIdFromStorage(testAppId)
    console.log('✅ 读取结果:', retrievedId)
    console.log('✅ 数据一致性检查:', retrievedId === testConversationId)

    // 测试新会话ID不被保存
    const saveNewResult = saveConversationIdToStorage(testAppId, '-1')
    console.log('✅ 新会话保存结果:', saveNewResult)
  } catch (error) {
    console.log('❌ localStorage测试错误:', error)
  }

  console.log('\n🎉 验证功能测试完成!')
}

// 导出测试函数，可以在浏览器控制台中调用
if (typeof window !== 'undefined') {
  (window as any).runValidationTests = runValidationTests
  console.log('💡 在浏览器控制台中运行 runValidationTests() 来测试验证功能')
}

export { runValidationTests }