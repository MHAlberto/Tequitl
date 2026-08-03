import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import frasesData from '../../../frases.json'
import type { Frase } from '../../types/global'

export default function QuoteBar() {
  const [quote, setQuote] = useState<Frase | null>(null)

  useEffect(() => {
    const frases = frasesData.frases as Frase[]
    if (frases && frases.length > 0) {
      const randomIndex = Math.floor(Math.random() * frases.length)
      setQuote(frases[randomIndex])
    }
  }, [])

  if (!quote) return null

  return (
    <div className="bg-white border-2 border-neutral-900 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 stroke-[2.5] shrink-0 mt-0.5 text-neutral-900" />
        <div>
          <p className="text-sm font-bold text-neutral-900 italic leading-relaxed">
            &ldquo;{quote.frase}&rdquo;
          </p>
          <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
            {quote.autor}
          </p>
        </div>
      </div>
    </div>
  )
}
