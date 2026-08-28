'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Separator } from '@/components/ui/separator'
import {
  Accessibility, Type, Eye, Minus, Plus, RotateCcw, MousePointer2,
  Volume2, Ruler, Palette, X, Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Toggle Button ──────────────────────────────── */
function ToggleBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left',
        active ? 'bg-blue-600 text-white' : 'hover:bg-accent text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      <div className={cn('w-8 h-5 rounded-full transition-colors relative', active ? 'bg-blue-600' : 'bg-muted-foreground/40')}>
        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform', active ? 'left-3.5' : 'left-0.5')} />
      </div>
    </button>
  )
}

const COLOR_OVERLAYS = [
  { color: 'rgba(255,255,0,0.2)', label: 'Yellow', hex: '#FFD700' },
  { color: 'rgba(255,165,0,0.2)', label: 'Orange', hex: '#FFA500' },
  { color: 'rgba(0,191,255,0.2)', label: 'Blue', hex: '#00BFFF' },
  { color: 'rgba(144,238,144,0.2)', label: 'Green', hex: '#90EE90' },
  { color: 'rgba(255,182,193,0.2)', label: 'Pink', hex: '#FFB6C1' },
  { color: 'rgba(221,160,221,0.2)', label: 'Purple', hex: '#DDA0DD' },
]

/* ── Slider sub-component (defined outside to avoid re-creation) ── */
function AccessSlider({ value, min, max, step, color, onMinus, onPlus, label, unit = 'px' }: {
  value: number; min: number; max: number; step: number; color: string;
  onMinus: () => void; onPlus: () => void; label: string; unit?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onMinus} className="h-8 w-8 rounded-lg border bg-background flex items-center justify-center hover:bg-accent transition" aria-label={`Decrease ${label}`}><Minus className="h-3 w-3" /></button>
        <div className="flex-1 h-2 rounded-full bg-muted relative">
          <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color }} />
        </div>
        <button onClick={onPlus} className="h-8 w-8 rounded-lg border bg-background flex items-center justify-center hover:bg-accent transition" aria-label={`Increase ${label}`}><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

export function AccessibilityToolbar() {
  const fontSize = useAppStore((s) => s.fontSize)
  const setFontSize = useAppStore((s) => s.setFontSize)
  const language = useAppStore((s) => s.language)
  const accessibilityOpen = useAppStore((s) => s.accessibilityOpen)
  const setAccessibilityOpen = useAppStore((s) => s.setAccessibilityOpen)
  const dyslexiaFont = useAppStore((s) => s.dyslexiaFont)
  const setDyslexiaFont = useAppStore((s) => s.setDyslexiaFont)
  const highContrast = useAppStore((s) => s.highContrast)
  const setHighContrast = useAppStore((s) => s.setHighContrast)
  const lineHeight = useAppStore((s) => s.lineHeight)
  const setLineHeight = useAppStore((s) => s.setLineHeight)
  const letterSpacing = useAppStore((s) => s.letterSpacing)
  const setLetterSpacing = useAppStore((s) => s.setLetterSpacing)
  const readingRuler = useAppStore((s) => s.readingRuler)
  const setReadingRuler = useAppStore((s) => s.setReadingRuler)
  const colorOverlay = useAppStore((s) => s.colorOverlay)
  const setColorOverlay = useAppStore((s) => s.setColorOverlay)
  const textToSpeech = useAppStore((s) => s.textToSpeech)
  const setTextToSpeech = useAppStore((s) => s.setTextToSpeech)
  const largeCursors = useAppStore((s) => s.largeCursors)
  const setLargeCursors = useAppStore((s) => s.setLargeCursors)
  const reduceAnimations = useAppStore((s) => s.reduceAnimations)
  const setReduceAnimations = useAppStore((s) => s.setReduceAnimations)
  const resetAccessibility = useAppStore((s) => s.resetAccessibility)

  const isFil = language === 'fil'

  /* ── Apply accessibility styles to document ──────── */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dyslexia-font', dyslexiaFont)
    root.dataset.contrast = highContrast
    root.style.lineHeight = String(lineHeight)
    root.style.letterSpacing = letterSpacing > 0 ? `${letterSpacing}px` : 'normal'
    root.classList.toggle('large-cursors', largeCursors)
    root.classList.toggle('reduce-motion', reduceAnimations)
    root.classList.toggle('reading-ruler-active', readingRuler)
    document.body.style.fontSize = `${fontSize}px`
    return () => {
      root.classList.remove('dyslexia-font', 'large-cursors', 'reduce-motion', 'reading-ruler-active')
      root.style.removeProperty('lineHeight')
      root.style.removeProperty('letterSpacing')
      root.removeAttribute('data-contrast')
      document.body.style.removeProperty('fontSize')
    }
  }, [dyslexiaFont, highContrast, lineHeight, letterSpacing, largeCursors, reduceAnimations, readingRuler, fontSize])

  /* ── Text-on selection ────────────────── */
  useEffect(() => {
    if (!textToSpeech) return
    const handleSelection = () => {
      const text = window.getSelection()?.toString().trim()
      if (!text) return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const voices = speechSynthesis.getVoices()
      const fil = voices.find((v) => v.lang.startsWith('fil'))
      const en = voices.find((v) => v.lang.startsWith('en'))
      if (isFil && fil) u.voice = fil
      else if (en) u.voice = en
      speechSynthesis.speak(u)
    }
    document.addEventListener('mouseup', handleSelection)
    return () => { document.removeEventListener('mouseup', handleSelection); speechSynthesis.cancel() }
  }, [textToSpeech, isFil])

  const handleTTS = useCallback(() => {
    if (textToSpeech) { speechSynthesis.cancel(); setTextToSpeech(false) }
    else { setTextToSpeech(true) }
  }, [textToSpeech, setTextToSpeech])

  return (
    <>
      {/* ── Floating trigger ── */}
      <button
        onClick={() => setAccessibilityOpen(!accessibilityOpen)}
        className={cn(
          'fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all hover:shadow-xl',
          accessibilityOpen ? 'bg-foreground text-background' : 'bg-blue-600 text-white hover:bg-blue-700',
        )}
        aria-label="Accessibility"
      >
        {accessibilityOpen ? <X className="h-5 w-5" /> : <Accessibility className="h-5 w-5" />}
        <span className="text-sm font-semibold hidden sm:inline">{accessibilityOpen ? 'Close' : 'Accessibility'}</span>
      </button>

      {/* ── Color overlay ── */}
      {colorOverlay && <div className="fixed inset-0 z-[200] pointer-events-none" style={{ backgroundColor: colorOverlay }} aria-hidden="true" />}

      {/* ── Reading ruler ── */}
      {readingRuler && <ReadingRuler />}

      {/* ── Panel ── */}
      {accessibilityOpen && (
        <div className="fixed bottom-16 right-3 sm:right-5 z-[150] w-[320px] max-h-[80vh] overflow-y-auto rounded-xl border bg-card shadow-lg">
          <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-base">Accessibility</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{isFil ? 'I-customize ang iyong karanasan sa pagbasa' : 'Customize your reading experience'}</p>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <AccessSlider value={fontSize} min={12} max={28} step={1} color="#2563eb" onMinus={() => setFontSize(fontSize - 1)} onPlus={() => setFontSize(fontSize + 1)} label={isFil ? 'Laki ng Font' : 'Font Size'} />
            <AccessSlider value={lineHeight} min={1.2} max={3} step={0.1} color="#10b981" onMinus={() => setLineHeight(lineHeight - 0.1)} onPlus={() => setLineHeight(lineHeight + 0.1)} label={isFil ? 'Taas ng Linya' : 'Line Height'} unit="" />
            <AccessSlider value={letterSpacing} min={0} max={5} step={0.5} color="#8b5cf6" onMinus={() => setLetterSpacing(letterSpacing - 0.5)} onPlus={() => setLetterSpacing(letterSpacing + 0.5)} label={isFil ? 'Espasyo ng Letra' : 'Letter Spacing'} />

            <Separator className="my-1" />

            <ToggleBtn active={dyslexiaFont} onClick={() => setDyslexiaFont(!dyslexiaFont)} icon={Type} label={isFil ? 'Font para sa Dyslexic' : 'Dyslexia-Friendly Font'} />
            <ToggleBtn active={readingRuler} onClick={() => setReadingRuler(!readingRuler)} icon={Ruler} label="Reading Ruler" />
            <ToggleBtn active={textToSpeech} onClick={handleTTS} icon={Volume2} label={isFil ? 'Text-to-Speech (I-highlight ang text)' : 'Text-to-Speech (highlight text)'} />
            <ToggleBtn active={largeCursors} onClick={() => setLargeCursors(!largeCursors)} icon={MousePointer2} label={isFil ? 'Malaking Cursor' : 'Large Cursors'} />
            <ToggleBtn active={reduceAnimations} onClick={() => setReduceAnimations(!reduceAnimations)} icon={Eye} label={isFil ? 'Bawasan ang Animasyon' : 'Reduce Animations'} />

            <Separator className="my-1" />

            {/* ── Contrast ── */}
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{isFil ? 'Kontrast' : 'Contrast'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'high', 'inverted'] as const).map((mode) => (
                  <button key={mode} onClick={() => setHighContrast(mode)} className={cn('rounded-lg border-2 px-2 py-2 text-xs font-medium transition-all', highContrast === mode ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-transparent bg-background hover:border-border')}>
                    {mode === 'none' ? (isFil ? 'Normal' : 'Normal') : mode === 'high' ? (isFil ? 'Taas' : 'High') : (isFil ? 'Baliktad' : 'Inverted')}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Color Overlay ── */}
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Color Overlay</span>
                {colorOverlay && <button onClick={() => setColorOverlay(null)} className="ml-auto text-xs text-red-500 hover:underline">{isFil ? 'Alisin' : 'Remove'}</button>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OVERLAYS.map((c) => (
                  <button key={c.hex} onClick={() => setColorOverlay(colorOverlay === c.color ? null : c.color)} className={cn('w-8 h-8 rounded-full border-2 transition-all hover:scale-110', colorOverlay === c.color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-border')} style={{ backgroundColor: c.hex }} title={c.label} aria-label={`${c.label} overlay`} />
                ))}
              </div>
            </div>

            <Separator className="my-1" />

            <button onClick={resetAccessibility} className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
              <RotateCcw className="h-4 w-4" />
              {isFil ? 'I-reset Lahat' : 'Reset All'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ReadingRuler() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => { if (ref.current) ref.current.style.top = `${e.clientY - 16}px` }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <div ref={ref} className="fixed left-0 right-0 z-[190] h-8 pointer-events-none" style={{ background: 'linear-gradient(180deg,rgba(59,130,246,0.15),rgba(59,130,246,0.08))', borderTop: '2px solid rgba(59,130,246,0.3)', borderBottom: '2px solid rgba(59,130,246,0.3)' }} aria-hidden="true" />
}
