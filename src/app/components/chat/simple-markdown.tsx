'use client'

interface SimpleMarkdownProps {
    content: string;
}

export function SimpleMarkdown({ content }: SimpleMarkdownProps) {
    // 简单的 Markdown 解析器作为备用方案
    const parseMarkdown = (text: string) => {
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 标题
            if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={i} className="text-base font-medium mb-1 mt-2">
                        {line.substring(4)}
                    </h3>
                );
            } else if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={i} className="text-lg font-semibold mb-2 mt-3">
                        {line.substring(3)}
                    </h2>
                );
            } else if (line.startsWith('# ')) {
                elements.push(
                    <h1 key={i} className="text-xl font-bold mb-2 mt-4">
                        {line.substring(2)}
                    </h1>
                );
            }
            // 列表项
            else if (line.startsWith('- ')) {
                elements.push(
                    <li key={i} className="mb-1 ml-4 list-disc">
                        {parseInlineElements(line.substring(2))}
                    </li>
                );
            }
            // 空行
            else if (line.trim() === '') {
                elements.push(<br key={i} />);
            }
            // 普通段落
            else if (line.trim() !== '') {
                elements.push(
                    <p key={i} className="mb-2">
                        {parseInlineElements(line)}
                    </p>
                );
            }
        }
        
        return elements;
    };
    
    // 解析内联元素（链接、粗体等）
    const parseInlineElements = (text: string) => {
        // 简单的链接解析 [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            // 添加链接前的文本
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            
            // 添加链接
            parts.push(
                <a
                    key={match.index}
                    href={match[2]}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {match[1]}
                </a>
            );
            
            lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余文本
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        
        return parts.length > 0 ? parts : text;
    };
    
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
            {parseMarkdown(content)}
        </div>
    );
}
