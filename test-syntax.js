// 测试可选链和空值合并操作符
const obj = {
  nested: {
    value: 'hello'
  }
};

// 可选链操作符测试
console.log('可选链测试:');
console.log(obj?.nested?.value); // 应该输出: hello
console.log(obj?.missing?.value); // 应该输出: undefined

// 空值合并操作符测试
console.log('空值合并测试:');
const nullValue = null;
const undefinedValue = undefined;
const emptyString = '';
const zeroValue = 0;

console.log(nullValue ?? 'default'); // 应该输出: default
console.log(undefinedValue ?? 'default'); // 应该输出: default
console.log(emptyString ?? 'default'); // 应该输出: '' (空字符串不是 null/undefined)
console.log(zeroValue ?? 'default'); // 应该输出: 0 (0不是 null/undefined)

// 组合使用
console.log('组合使用:');
console.log(obj?.missing?.value ?? 'not found'); // 应该输出: not found
