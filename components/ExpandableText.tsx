'use client'

import { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export default function ExpandableText({ text, maxLength = 180, className = '' }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= maxLength) {
    return <p className={`break-words whitespace-pre-wrap ${className}`}>{text}</p>
  }

  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...'

  return (
    <div className="relative">
      <p className={`break-words whitespace-pre-wrap ${className}`}>
        {displayText}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-1 transition-colors flex items-center gap-1 focus:outline-none"
      >
        {isExpanded ? 'Ver menos' : 'Ver más'}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
