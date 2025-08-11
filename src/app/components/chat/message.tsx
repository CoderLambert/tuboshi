
import styles from './style.module.css'
export function MessageInfo(){

    const renderUserMessage = () =>{
        return (    
            <div className={`${styles.message} ${styles.userMessage}`}>
                派件流程包括以下步骤
            </div>
        )
    }

    const renderAgentMessage = () => {
        return  (   
            <div className={`${styles.message} ${styles.agentMessage}`}>
                派件流程包括以下步骤： 1.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 2.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述 3.这里是详细描述这里是详细描述这里是详细描述这里是详细描述这里是详细描述
            </div>
        )
    }

    return <div className={styles.messageList}>
        {
            renderUserMessage()
        }

        {
            renderAgentMessage()
        }
    </div>
}