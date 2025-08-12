import style from './style.module.css'

export function AgentMessage({
    message
}: {
    message: string;
}) {
    return (
        <div className={`${style.message} ${style.agentMessage}`}>
            {message}
        </div>
    )
}