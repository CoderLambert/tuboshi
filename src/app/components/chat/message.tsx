'use client'

import styles from './style.module.css'
import { UserMessage } from './user-message'
import { AgentMessage } from './agent-message'
export function MessageInfo() {
    const messages = [
        {
            role: 'user',
            content: '派件流程包括以下步骤',
        },
        {
            role: 'assistant',
            content: '# 派件流程',
        },
    ]

    return (
        <div className={`${styles.messageList} ${styles.messageListAnimated}`}>
            {
                messages.map((message, index) => {
                    if (message.role === 'user')
                        return <UserMessage key={index} message={message.content} />
                     else
                        return <AgentMessage key={index} message={message.content} />
                })
            }
        </div>
    )
}
