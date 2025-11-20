/**
 * 重构后逻辑验证测试
 * 确保重构后的行为与原始代码逻辑一致
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

// 测试结果类型
interface TestResult {
  testName: string
  input: any
  expected: any
  actual: any
  passed: boolean
  error?: string
}

class ValidationTester {
  private results: TestResult[] = []

  // 添加测试结果
  private addResult(
    testName: string,
    input: any,
    expected: any,
    actual: any,
    passed: boolean,
    error?: string,
  ) {
    this.results.push({
      testName,
      input,
      expected,
      actual,
      passed,
      error,
    })
  }

  // 测试会话ID验证
  testConversationIdValidation() {
    console.log('🧪 测试会话ID验证...')

    // 测试1: 有效ID
    try {
      const result = validateConversationId('conv-123')
      this.addResult(
        '有效会话ID',
        'conv-123',
        'conv-123',
        result,
        result === 'conv-123',
      )
    } catch (error) {
      this.addResult('有效会话ID', 'conv-123', 'conv-123', null, false, String(error))
    }

    // 测试2: 新会话标识符
    try {
      const result = validateConversationId('-1')
      this.addResult(
        '新会话标识符',
        '-1',
        '-1',
        result,
        result === '-1',
      )
    } catch (error) {
      this.addResult('新会话标识符', '-1', '-1', null, false, String(error))
    }

    // 测试3: 空字符串应该失败
    try {
      const result = validateConversationId('')
      this.addResult('空会话ID', '', 'throw error', result, false)
    } catch (error) {
      this.addResult('空会话ID', '', 'throw error', 'error thrown', true)
    }

    // 测试4: null应该失败
    try {
      const result = validateConversationId(null)
      this.addResult('null会话ID', null, 'throw error', result, false)
    } catch (error) {
      this.addResult('null会话ID', null, 'throw error', 'error thrown', true)
    }
  }

  // 测试应用ID验证
  testAppIdValidation() {
    console.log('🧪 测试应用ID验证...')

    // 测试1: 有效AppID
    try {
      const result = validateAppId('app-456')
      this.addResult(
        '有效应用ID',
        'app-456',
        'app-456',
        result,
        result === 'app-456',
      )
    } catch (error) {
      this.addResult('有效应用ID', 'app-456', 'app-456', null, false, String(error))
    }

    // 测试2: 空AppID应该返回空字符串（保持原有逻辑）
    try {
      const result = validateAppId('')
      this.addResult(
        '空应用ID',
        '',
        '',
        result,
        result === '',
      )
    } catch (error) {
      this.addResult('空应用ID', '', '', null, false, String(error))
    }
  }

  // 测试新会话检查
  testNewConversationCheck() {
    console.log('🧪 测试新会话检查...')

    // 测试1: "-1"是新会话
    const result1 = isNewConversation('-1')
    this.addResult(
      '检查新会话(-1)',
      '-1',
      true,
      result1,
      result1 === true,
    )

    // 测试2: "123"不是新会话
    const result2 = isNewConversation('123')
    this.addResult(
      '检查新会话(123)',
      '123',
      false,
      result2,
      result2 === false,
    )
  }

  // 测试切换会话参数验证
  testSwitchConversationParams() {
    console.log('🧪 测试切换会话参数验证...')

    // 测试1: 有效参数
    try {
      const result = validateSwitchConversationParams({
        conversationId: 'conv-123',
        appId: 'app-456',
      })
      this.addResult(
        '有效切换参数',
        { conversationId: 'conv-123', appId: 'app-456' },
        { conversationId: 'conv-123', appId: 'app-456' },
        result,
        result.conversationId === 'conv-123' && result.appId === 'app-456',
      )
    } catch (error) {
      this.addResult(
        '有效切换参数',
        { conversationId: 'conv-123', appId: 'app-456' },
        { conversationId: 'conv-123', appId: 'app-456' },
        null,
        false,
        String(error),
      )
    }

    // 测试2: 无效会话ID
    try {
      const result = validateSwitchConversationParams({
        conversationId: '',
        appId: 'app-456',
      })
      this.addResult(
        '无效切换参数',
        { conversationId: '', appId: 'app-456' },
        'throw error',
        result,
        false,
      )
    } catch (error) {
      this.addResult(
        '无效切换参数',
        { conversationId: '', appId: 'app-456' },
        'throw error',
        'error thrown',
        true,
      )
    }
  }

  // 测试localStorage操作
  testLocalStorageOperations() {
    console.log('🧪 测试localStorage操作...')

    const testAppId = 'test-app-validation'
    const testConversationId = 'test-conv-456'

    try {
      // 测试保存
      const saveResult = saveConversationIdToStorage(testAppId, testConversationId)
      this.addResult(
        '保存到localStorage',
        { appId: testAppId, conversationId: testConversationId },
        true,
        saveResult,
        saveResult === true,
      )

      // 测试读取
      const retrievedId = getConversationIdFromStorage(testAppId)
      this.addResult(
        '从localStorage读取',
        testAppId,
        testConversationId,
        retrievedId,
        retrievedId === testConversationId,
      )

      // 测试新会话ID不被保存
      const saveNewResult = saveConversationIdToStorage(testAppId, '-1')
      this.addResult(
        '保存新会话ID',
        { appId: testAppId, conversationId: '-1' },
        true,
        saveNewResult,
        saveNewResult === true,
      )

      // 验证新会话ID确实没有被保存
      const stillRetrievedId = getConversationIdFromStorage(testAppId)
      this.addResult(
        '验证新会话ID未保存',
        testAppId,
        testConversationId,
        stillRetrievedId,
        stillRetrievedId === testConversationId,
      )
    } catch (error) {
      this.addResult(
        'localStorage操作',
        'multiple operations',
        'success',
        null,
        false,
        String(error),
      )
    }
  }

  // 运行所有测试
  runAllTests() {
    console.log('🚀 开始验证重构后的逻辑一致性...\n')

    this.testConversationIdValidation()
    this.testAppIdValidation()
    this.testNewConversationCheck()
    this.testSwitchConversationParams()
    this.testLocalStorageOperations()

    // 输出结果
    console.log('\n📊 测试结果汇总:')
    console.log('=' .repeat(60))

    let passedCount = 0
    let totalCount = this.results.length

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      console.log(`${status} ${index + 1}. ${result.testName}`)

      if (!result.passed) {
        console.log(`   输入: ${JSON.stringify(result.input)}`)
        console.log(`   期望: ${JSON.stringify(result.expected)}`)
        console.log(`   实际: ${JSON.stringify(result.actual)}`)
        if (result.error) {
          console.log(`   错误: ${result.error}`)
        }
      }

      if (result.passed) {
        passedCount++
      }
    })

    console.log('=' .repeat(60))
    console.log(`总计: ${passedCount}/${totalCount} 个测试通过`)

    if (passedCount === totalCount) {
      console.log('\n🎉 所有测试通过！重构后的逻辑与预期行为一致。')
      return true
    } else {
      console.log(`\n⚠️  ${totalCount - passedCount} 个测试失败，需要检查重构逻辑。`)
      return false
    }
  }
}

// 导出测试器
export const validationTester = new ValidationTester()

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).runValidationTests = () => validationTester.runAllTests()
  console.log('💡 在浏览器控制台中运行 runValidationTests() 来执行验证测试')
} else {
  // Node.js环境
  console.log('📦 验证测试模块已加载')
}