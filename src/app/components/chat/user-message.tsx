import styles from './style.module.css'

export function UserMessage({
    message,
}: {
    message: string;
}) {
    return (
        <div className={`${styles.message} ${styles.userMessage}`}>
            {message}
        </div>
    )
}
