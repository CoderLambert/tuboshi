'use client'

export default function TestSyntaxPage() {
  const testObj = {
    nested: {
      value: 'Hello Chrome 70!'
    }
  }

  // 测试可选链
  const optionalChainResult = testObj?.nested?.value
  const optionalChainMissing = testObj?.missing?.value

  // 测试空值合并
  const nullValue = null
  const undefinedValue = undefined
  const emptyString = ''
  const zeroValue = 0

  const nullishResult1 = nullValue ?? 'default for null'
  const nullishResult2 = undefinedValue ?? 'default for undefined'
  const nullishResult3 = emptyString ?? 'default for empty string'
  const nullishResult4 = zeroValue ?? 'default for zero'

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>语法转换测试页面</h1>
      
      <h2>可选链操作符 (?.) 测试:</h2>
      <p>testObj?.nested?.value = {optionalChainResult}</p>
      <p>testObj?.missing?.value = {String(optionalChainMissing)}</p>
      
      <h2>空值合并操作符 (??) 测试:</h2>
      <p>null ?? 'default' = {nullishResult1}</p>
      <p>undefined ?? 'default' = {nullishResult2}</p>
      <p>'' ?? 'default' = {nullishResult3}</p>
      <p>0 ?? 'default' = {nullishResult4}</p>
      
      <h2>浏览器信息:</h2>
      <p>User Agent: {navigator.userAgent}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>如果你能看到这个页面且所有值都正确显示，说明语法转换成功！</strong>
      </div>
    </div>
  )
}
