#!/usr/bin/env node

/**
 * 检查构建后的文件是否正确转换了现代语法
 */

const fs = require('fs');
const path = require('path');

// 需要检查的现代语法模式
const modernSyntaxPatterns = [
  /\?\?/g,  // Nullish coalescing
  /\?\./g,  // Optional chaining
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

    modernSyntaxPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const syntaxName = index === 0 ? 'Nullish Coalescing (??)' : 'Optional Chaining (?.)';
        issues.push({
          syntax: syntaxName,
          count: matches.length,
          pattern: pattern.toString()
        });
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

  // 递归查找所有 JS 文件
  function findJSFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        files.push(...findJSFiles(fullPath));
      } else if (stat.isFile() && item.endsWith('.js') && !item.endsWith('.map')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const jsFiles = findJSFiles(buildDir);

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
