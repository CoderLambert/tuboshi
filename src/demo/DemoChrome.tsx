'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { bridgeLog, getDemoLang, onBridgeLog, setDemoLang } from './bridge'
import { DEMO_LANGS } from './content'
import type { DemoLang } from './types'

const chip: CSSProperties = {
  pointerEvents: 'auto',
  border: 'none',
  borderRadius: 999,
  padding: '3px 8px',
  fontSize: 11,
  lineHeight: '14px',
  cursor: 'pointer',
}

function shorten(value: unknown) {
  const text = JSON.stringify(value)
  if (!text)
    return String(value)
  return text.length > 64 ? `${text.slice(0, 64)}…` : text
}

/** Fake phone status bar: clock, JSBridge log, and language switch. Sizes are px, not rem. */
export default function DemoChrome() {
  const [entries, setEntries] = useState(bridgeLog)
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [lang, setLang] = useState<DemoLang>('EN')

  useEffect(() => {
    setLang(getDemoLang())
    setEntries([...bridgeLog])
    const stop = onBridgeLog(() => setEntries([...bridgeLog]))
    const onToast = (event: Event) => {
      setToast(String((event as CustomEvent).detail || ''))
      window.setTimeout(() => setToast(''), 2200)
    }
    window.addEventListener('demo:toast', onToast)
    return () => {
      stop()
      window.removeEventListener('demo:toast', onToast)
    }
  }, [])

  return (
    <>
      <div
        data-demo-host-bar
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          fontSize: 13,
          fontFamily: '-apple-system, system-ui, sans-serif',
          color: '#1f2937',
          pointerEvents: 'none',
          background: 'linear-gradient(244deg, #FFE8E0 0%, #FBEFF3 50%, #FAE7D9 100%)',
        }}
      >
        <span style={{ fontWeight: 600, width: 40 }}>9:41</span>
        <button
          type="button"
          data-demo-bridge-toggle
          onClick={() => setOpen(value => !value)}
          style={{
            ...chip,
            background: open ? '#1f2937' : 'rgba(31,41,55,.08)',
            color: open ? '#fff' : '#374151',
          }}
        >
          JSBridge · {entries.length}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            data-demo-lang-switch
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              background: 'rgba(31,41,55,.08)',
              borderRadius: 999,
              padding: 2,
            }}
          >
            {DEMO_LANGS.map(item => (
              <button
                key={item.code}
                type="button"
                data-lang={item.code}
                onClick={() => setDemoLang(item.code)}
                style={{
                  ...chip,
                  padding: '2px 7px',
                  background: lang === item.code ? '#fff' : 'transparent',
                  color: lang === item.code ? '#111827' : '#6b7280',
                  fontWeight: lang === item.code ? 600 : 400,
                  boxShadow: lang === item.code ? '0 1px 2px rgba(0,0,0,.12)' : 'none',
                }}
              >
                {item.label}
              </button>
            ))}
          </span>
          <svg width="22" height="11" viewBox="0 0 22 11" aria-hidden>
            <rect x=".5" y=".5" width="18" height="10" rx="3" fill="none" stroke="#1f2937" opacity=".5" />
            <rect x="2" y="2" width="13" height="7" rx="1.5" fill="#1f2937" />
            <rect x="19.5" y="3.5" width="2" height="4" rx="1" fill="#1f2937" opacity=".5" />
          </svg>
        </span>
      </div>
      {open && (
        <div
          data-demo-bridge-log
          style={{
            position: 'fixed',
            top: 48,
            left: 10,
            right: 10,
            maxHeight: '46vh',
            overflow: 'auto',
            zIndex: 2001,
            background: 'rgba(17,24,39,.94)',
            color: '#e5e7eb',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 11,
            lineHeight: '16px',
            fontFamily: 'ui-monospace, Menlo, monospace',
            boxShadow: '0 10px 30px rgba(0,0,0,.25)',
          }}
        >
          <div style={{ color: '#9ca3af', marginBottom: 6, fontFamily: 'system-ui', fontSize: 12 }}>
            模拟宿主 App · flutter_inappwebview.callHandler 调用记录（演示数据）
          </div>
          {entries.slice().reverse().map((entry, index) => (
            <div
              key={`${entry.t}-${entry.method}-${index}`}
              style={{
                padding: '3px 0',
                borderTop: index ? '1px solid rgba(255,255,255,.08)' : 'none',
              }}
            >
              <span style={{ color: '#6b7280' }}>{new Date(entry.t).toTimeString().slice(0, 8)} </span>
              <span style={{ color: '#7dd3fc' }}>{entry.method}</span>
              <span style={{ color: '#6b7280' }}> → </span>
              <span style={{ color: '#d1fae5', wordBreak: 'break-all' }}>{shorten(entry.result)}</span>
            </div>
          ))}
        </div>
      )}
      {toast && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 110,
            transform: 'translateX(-50%)',
            zIndex: 2002,
            background: 'rgba(17,24,39,.9)',
            color: '#fff',
            fontSize: 12,
            padding: '8px 12px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            maxWidth: '90%',
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}
