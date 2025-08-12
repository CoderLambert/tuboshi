import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 新增：自定义规则覆盖
  {
    rules: {
      // 禁用 no-explicit-any（您的主要错误），建议逐步替换 any 为 unknown 或具体类型
      "@typescript-eslint/no-explicit-any": "off",  // 或 "warn" 以仅警告

      // 处理 no-unused-vars（未使用变量/导入）
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",  // 忽略以 _ 开头的变量
        "varsIgnorePattern": "^_"
      }],

      // 处理 React Hook 依赖缺失
      "react-hooks/exhaustive-deps": "warn",  // 改为警告，避免阻塞

      // 处理 no-unused-expressions（未使用表达式）
      "@typescript-eslint/no-unused-expressions": "off",  // 临时禁用

      // 处理 no-empty-object-type（空对象 {} 被视为 any）
      "@typescript-eslint/no-empty-object-type": "off",  // 或使用 object/unknown 替换

      // 其他可选：处理 JSX 评论问题
      "react/jsx-no-comment-textnodes": "warn",

      // 如果有更多规则，根据日志添加，例如：
      // "@typescript-eslint/no-new": "off"  // 如果有 no-new 错误
    }
  }

];

export default eslintConfig;
