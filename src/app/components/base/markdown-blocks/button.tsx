import { EVENTS, eventBus } from '@/app/utils/event-bus'
import Button from '@/app/components/base/button'
import cn from '@/utils/classnames'
import { useTranslation } from 'react-i18next'

const MarkdownButton = ({ node }: any) => {
  const variant = node.properties.dataVariant
  const message = node.properties.dataMessage
  const link = node.properties.dataLink
  const size = node.properties.dataSize
  const action = node.properties?.dataAction
  const { t } = useTranslation()

  function is_valid_url(url: string): boolean {
    try {
      const parsed_url = new URL(url)
      return ['http:', 'https:'].includes(parsed_url.protocol)
    }
    catch {
      return false
    }
  }

  function transformMessage(message: string): string {
    console.log(action, message)
    if(action && action === 'app.action.trackShipmentWithId') {
      return t(action, { trackingId: message })
    }
    return message
  }

  return <Button
    variant={variant}
    size={size}
    className={cn('!h-auto min-h-5.5 select-none whitespace-normal !px-3')}
    onClick={() => {
      if (is_valid_url(link)) { window.open(link, '_blank') }
      else {
        console.log(message)
        eventBus.emit(EVENTS.SEND_MESSAGE, transformMessage(message))
      }
    }}
  >
    <span className='text-[24px]'>{node.children[0]?.value || ''}</span>
  </Button>
}
MarkdownButton.displayName = 'MarkdownButton'

export default MarkdownButton
