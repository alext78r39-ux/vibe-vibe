'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const INLINE_REGEX = /[*_~`\[]/

const allowedElements = ['strong', 'em', 'del', 'code', 'a']

export function MarkdownTitle({ text }: { text: string }) {
  if (!INLINE_REGEX.test(text)) {
    return <>{text}</>
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={allowedElements}
      unwrapDisallowed
    >
      {text}
    </ReactMarkdown>
  )
}
