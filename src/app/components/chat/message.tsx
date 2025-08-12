
"use client"

import styles from './style.module.css'

export function MessageInfo(){
    const renderUserMessage = () => {
        return (
            <div
                className={`${styles.message} ${styles.userMessage} ${styles.messageAnimated}`}
                style={{ animationDelay: '100ms' }}
            >
                派件流程包括以下步骤
            </div>
        )
    }

    const renderAgentMessage = () => {
        return (
            <div
                className={`${styles.message} ${styles.agentMessage} ${styles.messageAnimated}`}
                style={{ animationDelay: '300ms' }}
            >
                派件流程包括以下步骤： 1.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 2.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 3.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述
            </div>
        )
    }

    return (
        <div className={`${styles.messageList} ${styles.messageListAnimated}`}>
            {renderUserMessage()}
            {renderAgentMessage()}
        </div>
    )
}