'use client'

import { useState, useRef, useEffect } from 'react'

interface ContactDropdownProps {
  contacto: string
}

export default function ContactDropdown({ contacto }: ContactDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse by comma, hyphen, pipe, or the word 'y'
  const contactosList = contacto
    .split(/[,|-]|\sy\s/i)
    .map(c => c.trim())
    .filter(Boolean)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (contactosList.length === 0) return null

  // If there's only 1 contact, render it as a direct button
  if (contactosList.length === 1) {
    const singleContact = contactosList[0]
    const isPhone = singleContact.replace(/\D/g, '').length >= 7
    
    if (isPhone) {
      return (
        <a
          href={`tel:${singleContact.replace(/[^0-9+]/g, '')}`}
          className="flex items-center gap-1.5 bg-white text-emerald-700 border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50"
        >
          <span className="text-emerald-600">📞</span> {singleContact}
        </a>
      )
    }
    
    return (
      <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-semibold max-w-[250px] sm:max-w-xs">
        <span className="text-gray-500 shrink-0">📞</span> 
        <span className="truncate" title={singleContact}>{singleContact}</span>
      </div>
    )
  }

  // If there are multiple contacts, render a dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white text-emerald-700 border border-emerald-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className="text-emerald-600">📞</span> {contactosList.length} Contactos
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {contactosList.map((c, idx) => {
            const isPhone = c.replace(/\D/g, '').length >= 7
            
            if (isPhone) {
              return (
                <a
                  key={idx}
                  href={`tel:${c.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-emerald-700 text-sm font-medium transition-colors w-full"
                >
                  <span className="text-emerald-600">📞</span> {c}
                </a>
              )
            }
            
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors w-full break-words"
              >
                <span className="text-gray-400">📞</span> {c}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
