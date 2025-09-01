import { Markdown } from '@/app/components/markdown'
import Question from '@/app/components/chat/question'
// 添加 忽略 ts 错误
// @ts-ignore
import taskMd from '../../../../task.md?raw'
export default function MarkdownPage() {
    return (
        <div className='prose flex h-full  w-full flex-col'>
            <Question
                id={'item.id'}
                useCurrentUserAvatar={false}
                imgSrcs={[]}
            content={taskMd}/>
            {/* <Answer

                item={{
                    id: '1',
                    content: '# Hello World',
                    role: 'assistant',

                }}
                  feedbackDisabled={true}
                  isResponding={false}
                  suggestionClick={() => {}}
            /> */}
        <Markdown content={'# Hello World'} />

        </div>
    )
}
