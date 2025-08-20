import type { FC } from 'react'
import React from 'react'
import type { ChatItem } from '@/types/app'
import Answer from './answer'
import Question from './question'
export type IHistoryMessageProps = {
  item: ChatItem
}
const HistoryMessage: FC<IHistoryMessageProps> = ({ item }) => {
  if (item.isAnswer) {
    // AI回答 - 历史消息禁用所有交互功能
    return (
      <div className="opacity-75">
        <Answer
          item={item}
          feedbackDisabled={true}
          isResponding={false}
          onFeedback={undefined}
          suggestionClick={undefined}
        />
      </div>
    )
  }
 else {
    // 用户问题
    return (
      <div className="opacity-75">
        <Question
          id={item.id}
          content={item.content}
          useCurrentUserAvatar={false}
          imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(file => file.url) : []}
        />
      </div>
    )
  }
}

export default React.memo(HistoryMessage)
