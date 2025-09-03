#!/usr/bin/env node

/**
 * 检查构建后的文件是否正确转换了现代语法
 */

const fs = require('fs');
const path = require('path');

// 需要检查的现代语法模式
const modernSyntaxPatterns = [
  { pattern: /\?\?/g, name: 'Nullish Coalescing (??)' },
  { pattern: /\?\./g, name: 'Optional Chaining (?.)' },
  { pattern: /\?\?=/g, name: 'Logical Assignment (??=)' },
  { pattern: /\|\|=/g, name: 'Logical Assignment (||=)' },
  { pattern: /&&=/g, name: 'Logical Assignment (&&=)' },
  { pattern: /\d+_\d+/g, name: 'Numeric Separator (_)' },
  { pattern: /#\w+/g, name: 'Private Fields (#)' },
];

// 需要检查的包名
const packagesToCheck = [
  'js-cookie',
  'i18next',
  'zustand',
  'react-i18next',
  'html-parse-stringify'
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    modernSyntaxPatterns.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        // 过滤掉一些误报
        let filteredMatches = matches;

        if (name.includes('Private Fields')) {
          // 过滤掉 CSS 颜色值、SVG ID、HTML ID 等误报
          filteredMatches = matches.filter(m => {
            // 排除 CSS 颜色值 (#fff, #123456)
            if (m.match(/^#[0-9a-fA-F]{3,8}$/)) return false;
            // 排除常见的 HTML/SVG ID 模式
            if (m.match(/^#(clip|document|x[0-9a-fA-F]+|[0-9]+_[0-9]+)$/)) return false;
            // 排除单字符或数字 ID
            if (m.match(/^#[0-9a-zA-Z]{1,2}$/)) return false;
            return true;
          });
        }

        if (name.includes('Numeric Separator')) {
          // 过滤掉版本号等误报 (如 2_6, 3_10)
          filteredMatches = matches.filter(m => {
            // 保留真正的数字分隔符，排除版本号模式
            return !m.match(/^[0-9]{1,2}_[0-9]{1,2}$/);
          });
        }

        if (filteredMatches.length > 0) {
          issues.push({
            syntax: name,
            count: filteredMatches.length,
            pattern: pattern.toString(),
            samples: filteredMatches.slice(0, 3)
          });
        }
      }
    });

    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  const buildDir = path.join(process.cwd(), '.next');

  if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('🔍 Checking for modern syntax in build files...\n');

  // 递归查找客户端 JS 文件（排除服务端文件）
  function findClientJSFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        // 只检查客户端相关目录
        if (item === 'static' || item === 'app' && !fullPath.includes('server')) {
          files.push(...findClientJSFiles(fullPath));
        }
      } else if (stat.isFile() && item.endsWith('.js') && !item.endsWith('.map')) {
        // 排除服务端文件和 manifest 文件
        if (!fullPath.includes('server') &&
          !item.includes('manifest') &&
          !item.includes('middleware')) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  const jsFiles = findClientJSFiles(buildDir);

  let totalIssues = 0;
  const fileIssues = [];

  jsFiles.forEach(filePath => {
    const issues = checkFile(filePath);
    if (issues.length > 0) {
      totalIssues += issues.reduce((sum, issue) => sum + issue.count, 0);
      fileIssues.push({
        file: path.relative(process.cwd(), filePath),
        issues
      });
    }
  });

  if (fileIssues.length === 0) {
    console.log('✅ No modern syntax found in build files. All packages were properly transpiled!');
  } else {
    console.log(`❌ Found ${totalIssues} instances of modern syntax in ${fileIssues.length} files:\n`);

    fileIssues.forEach(({ file, issues }) => {
      console.log(`📁 ${file}:`);
      issues.forEach(issue => {
        console.log(`   - ${issue.syntax}: ${issue.count} occurrences`);
        if (issue.samples && issue.samples.length > 0) {
          console.log(`     Examples: ${issue.samples.join(', ')}`);
        }
      });
      console.log('');
    });

    console.log('💡 This means the following packages may not be properly transpiled:');
    packagesToCheck.forEach(pkg => {
      console.log(`   - ${pkg}`);
    });

    console.log('\n🔧 To fix this, ensure these packages are included in transpilePackages in next.config.ts');
  }

  process.exit(fileIssues.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, modernSyntaxPatterns };
