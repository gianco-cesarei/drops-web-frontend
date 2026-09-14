import React, { useState, useEffect, useRef } from 'react'
import { api, type CuratorMessage } from '../api'

const QUICK_STARTERS = [
  { label: '🔥 Radar: 3 Release Calde / Sold-Out', prompt: 'Elenca subito le 3 release calde o sold-out da avere nel radar questa settimana con artista, etichetta e nota sonora.' },
  { label: '🎧 Raccomandazione Traccia per Stasera', prompt: 'Ho bisogno di una traccia speciale da suonare stasera. Fammi le domande per guidarmi.' },
  { label: '🎛️ Rarità e Release Vinyl-Only', prompt: 'Quali sono le 3 stampe in vinile più ricercate del radar al momento? Elencale subito con etichetta e nota sonora.' },
]

export default function CuratorDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<CuratorMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
      
      // Auto-trigger welcome radar if chat is empty
      if (messages.length === 0 && !loading) {
        handleSendMessage('Inizia la sessione: presentati brevemente ed elenca subito le 3 release calde o sold-out da avere nel radar questa settimana con artista, etichetta e nota sonora.')
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const userMessage: CuratorMessage = { role: 'user', content: text }
    const updatedMessages: CuratorMessage[] = [...messages, userMessage]
    
    // Append user message and prepare empty model placeholder
    setMessages([...updatedMessages, { role: 'model', content: '' }])
    if (!textToSend) setInput('')
    setLoading(true)
    setError(null)

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      await api.streamCurator(
        updatedMessages,
        (accumulatedText) => {
          setMessages([...updatedMessages, { role: 'model', content: accumulatedText }])
        },
        controller.signal
      )
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setLoading(false)
        return
      }
      setError(err?.message || 'Connessione al server non riuscita.')
      // If no text was received, remove the empty assistant placeholder
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'model' && !last.content) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetSession = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setMessages([])
    setError(null)
    setInput('')
    setLoading(false)
    // Trigger fresh welcome
    setTimeout(() => {
      handleSendMessage('Inizia la sessione: presentati brevemente ed elenca subito le 3 release calde o sold-out da avere nel radar questa settimana con artista, etichetta e nota sonora.')
    }, 100)
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={idx} style={{ height: '8px' }} />

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)
      
      const tokens: React.ReactNode[] = []
      let lastIdx = 0
      const comboRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g
      let cMatch: RegExpExecArray | null

      while ((cMatch = comboRegex.exec(line)) !== null) {
        if (cMatch.index > lastIdx) {
          tokens.push(line.slice(lastIdx, cMatch.index))
        }
        if (cMatch[1] && cMatch[2]) {
          const linkText = cMatch[1]
          const href = cMatch[2]
          let badgeColor = '#047857'
          let badgeBg = '#ecfdf5'
          let badgeBorder = '#a7f3d0'
          let serviceIcon = '🔗'

          if (href.includes('bandcamp.com')) {
            serviceIcon = '🟣'
            badgeColor = '#0369a1'
            badgeBg = '#f0f9ff'
            badgeBorder = '#bae6fd'
          } else if (href.includes('soundcloud.com')) {
            serviceIcon = '🟠'
            badgeColor = '#c2410c'
            badgeBg = '#fff7ed'
            badgeBorder = '#fed7aa'
          } else if (href.includes('youtube.com') || href.includes('youtu.be')) {
            serviceIcon = '🔴'
            badgeColor = '#b91c1c'
            badgeBg = '#fef2f2'
            badgeBorder = '#fecaca'
          }

          tokens.push(
            <a
              key={cMatch.index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                margin: '3px 4px 3px 0',
                padding: '3px 9px',
                borderRadius: '6px',
                backgroundColor: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: badgeColor,
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                verticalAlign: 'middle',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>{serviceIcon}</span>
              <span>{linkText}</span>
              <span style={{ fontSize: '10px' }}>↗</span>
            </a>
          )
        } else if (cMatch[3]) {
          tokens.push(
            <strong key={cMatch.index} style={{ color: '#047857', fontWeight: 600 }}>
              {cMatch[3]}
            </strong>
          )
        } else if (cMatch[4]) {
          tokens.push(
            <em key={cMatch.index} style={{ color: '#475569', fontStyle: 'italic' }}>
              {cMatch[4]}
            </em>
          )
        }
        lastIdx = comboRegex.lastIndex
      }

      if (lastIdx < line.length) {
        tokens.push(line.slice(lastIdx))
      }

      return (
        <div key={idx} style={{ 
          paddingLeft: isBullet ? '12px' : '0',
          marginBottom: '5px',
          lineHeight: '1.55',
          color: '#1e293b',
          fontSize: '13.5px'
        }}>
          {tokens.length > 0 ? tokens : line}
        </div>
      )
    })
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div style={{
        position: 'fixed',
        bottom: '86px',
        right: '24px',
        zIndex: 9998,
      }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 0 15px rgba(16, 185, 129, 0.15)',
            padding: '10px 16px',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          aria-label="Apri Drops Curator AI"
        >
          <span style={{
            display: 'inline-block',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }} />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em' }}>
            DROPS CURATOR <span style={{ color: '#059669', fontSize: '11px', textTransform: 'uppercase' }}>[AI]</span>
          </span>
        </button>
      </div>

      {/* Slide-over Drawer / Modal (White Background Theme) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            height: '100%',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.15)',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                  }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', color: '#0f172a' }}>
                    DROPS CURATOR <span style={{ color: '#059669', fontSize: '11px' }}>AI</span>
                  </h3>
                </div>
                <p style={{ margin: '2px 0 0 16px', fontSize: '11.5px', color: '#64748b' }}>
                  Underground Sound Selector • Zero Memory Session
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleResetSession}
                  title="Azzera e ricomincia sessione"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981'
                    e.currentTarget.style.color = '#047857'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#475569'
                  }}
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Chiudi pannello"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Ephemeral Notice */}
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '11px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>⚡ Sessione senza memoria: si azzera alla chiusura della scheda.</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>BRAIN V1</span>
            </div>

            {/* Chat Body (White Background) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#ffffff',
            }}>
              {messages.length === 0 && !loading && (
                <div style={{
                  padding: '20px 10px',
                  textAlign: 'center',
                  color: '#64748b',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎧</div>
                  <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '15px' }}>Benvenuto nel Radar Underground</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '320px', margin: '0 auto 18px auto' }}>
                    Chiedi selezioni per slot specifici di set, radar sold-out o transizioni armoniche basate sul Canone Drops.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {QUICK_STARTERS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s.prompt)}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          color: '#334155',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981'
                          e.currentTarget.style.backgroundColor = '#f0fdf4'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.backgroundColor = '#f8fafc'
                        }}
                      >
                        <span>{s.label}</span>
                        <span style={{ color: '#059669', fontSize: '13px' }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      fontSize: '10.5px',
                      color: isUser ? '#059669' : '#64748b',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                    }}>
                      {isUser ? 'Tu' : 'Drops Curator'}
                    </div>
                    <div style={{
                      maxWidth: '92%',
                      padding: '12px 14px',
                      borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      backgroundColor: isUser ? '#059669' : '#f8fafc',
                      border: isUser ? '1px solid #047857' : '1px solid #e2e8f0',
                      boxShadow: isUser ? '0 2px 8px rgba(5, 150, 105, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}>
                      {isUser ? (
                        <div style={{ color: '#ffffff', fontSize: '13.5px', lineHeight: '1.4' }}>{msg.content}</div>
                      ) : (
                        formatContent(msg.content)
                      )}
                    </div>
                  </div>
                )
              })}

              {loading && (!messages.length || messages[messages.length - 1]?.role !== 'model' || !messages[messages.length - 1]?.content) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#047857',
                  fontSize: '12.5px',
                  padding: '10px 14px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  width: 'fit-content',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 1s infinite alternate',
                  }} />
                  Il Curatore sta consultando il Brain...
                </div>
              )}

              {error && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                }}>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form (White Theme) */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!loading) {
                  handleSendMessage()
                }
              }}
              style={{
                padding: '14px 16px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: '8px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chiedi al curatore o rispondi alle domande..."
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#0f172a',
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981'
                  e.target.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.backgroundColor = '#f8fafc'
                }}
              />
              <button
                type={loading ? 'button' : 'submit'}
                onClick={loading ? handleStopGeneration : undefined}
                disabled={!loading && !input.trim()}
                style={{
                  backgroundColor: loading ? '#475569' : input.trim() ? '#059669' : '#e2e8f0',
                  color: loading || input.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: loading || input.trim() ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                }}
              >
                {loading ? 'Ferma' : 'Invia'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
