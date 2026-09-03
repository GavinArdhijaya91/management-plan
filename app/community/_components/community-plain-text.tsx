import { ExternalLink } from 'lucide-react'

const urlPattern = /(https?:\/\/[^\s]+)/g

export function CommunityPlainText({ children, className = '' }: { children: string; className?: string }) {
  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {children.split(urlPattern).map((part, index) =>
        part.match(/^https?:\/\//) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-1 text-blue-700 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-700"
          >
            <span className="break-all">{part}</span>
            <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          part
        ),
      )}
    </p>
  )
}
