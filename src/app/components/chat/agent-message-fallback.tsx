'use client'
import { SimpleMarkdown } from './simple-markdown'

export function AgentMessageFallback({
    message,
}: {
    message?: string;
}) {
    const markdownText = message || `
# React Markdown Example

- Some text
- Some other text

## Subtitle

### Additional info

This is a [link](https://github.com/remarkjs/react-markdown)
`

    return <SimpleMarkdown content={markdownText} />
}
