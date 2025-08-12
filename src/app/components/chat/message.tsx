
"use client"

import styles from './style.module.css'
import { UserMessage } from './user-message'
import { AgentMessage } from './agent-message'
export function MessageInfo(){

    const messages = [
        {
            role: 'user',
            content: '派件流程包括以下步骤'
        },
        {
            role: 'assistant',
            content: '派件流程包括以下步骤：\n 1.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 2.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 3.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述'
        }
    ]

    return (
        <div className={`${styles.messageList} ${styles.messageListAnimated}`}>
            {
                messages.map((message, index) => {
                    if (message.role === 'user') {
                        return <UserMessage key={index} message={message.content} />
                    } else {
                        return <AgentMessage key={index} message={message.content} />
                    }
                })
            }
        </div>
    )
}