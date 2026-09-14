import React, { useState, useEffect, useRef } from 'react'
import { api, type CuratorMessage } from '../api'

const QUICK_STARTERS = [
  { label: '🔥 Radar: 3 Release Calde / Sold-Out', prompt: 'Inizia la sessione: dammi subito le 3 release calde o sold-out da tenere d\'occhio questa settimana.' },
  { label: '🎧 Prepariamo un DJ Set', prompt: 'Ho bisogno di preparare una selezione per stasera. Fammi le domande per calibrare le tracce.' },
  { label: '🎛️ Tension Bridge (7A / 11A)', prompt: 'Cerco un Tension Bridge tra 120 e 126 BPM in chiave minore (7A o 11A) per alzare la tensione senza accelerare.' },
  { label: '⚡ Peak Starter per Fase [3]', prompt: 'Consigliami un Peak Starter da 127-128 BPM con attacco percussivo secco per aprire il picco.' },
]

const QUICK_PHASE_CHIPS = [
  '[1] Warm Up (≤119 BPM)',
  '[2-3B] Holding (120-124 BPM, Major)',
  '[2-3A] Tension Bridge (7A/11A)',
  '[3] Peak Starter (127-128 BPM)',
  '[4] Plateau (128-132 BPM)',
  '[5] Outro / Breakbeat',
]

export default function CuratorDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<CuratorMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
      
      // Auto-trigger welcome radar if chat is empty
      if (messages.length === 0 && !loading) {
        handleSendMessage('Inizia la sessione: presentati e dammi le 3 release calde o sold-out da tenere d\'occhio.')
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const newMessages: CuratorMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    if (!textToSend) setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await api.chatCurator(newMessages)
      if (res.success && res.reply) {
        setMessages([...newMessages, { role: 'model', content: res.reply }])
      } else {
        setError(res.reply || 'Errore nella ricezione della risposta dal Curatore.')
      }
    } catch (err: any) {
      setError(err?.message || 'Connessione al server non riuscita.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSession = () => {
    setMessages([])
    setError(null)
    setInput('')
    // Trigger fresh welcome
    setTimeout(() => {
      handleSendMessage('Inizia la sessione: dammi le 3 release calde o sold-out da tenere d\'occhio.')
    }, 100)
  }

  const formatContent = (content: string) => {
    // Simple markdown-style bold and bullet parser
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={idx} style={{ height: '8px' }} />

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)
      
      // Parse **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#34d399', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      return (
        <div key={idx} style={{ 
          paddingLeft: isBullet ? '12px' : '0',
          marginBottom: '4px',
          lineHeight: '1.5',
          color: '#e2e8f0',
          fontSize: '13.5px'
        }}>
          {parts}
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
            backgroundColor: '#090d0b',
            color: '#f8fafc',
            border: '1px solid #1e2922',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(16, 185, 129, 0.2)',
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
            e.currentTarget.style.borderColor = '#1e2922'
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
            DROPS CURATOR <span style={{ color: '#10b981', fontSize: '11px', textTransform: 'uppercase' }}>[AI]</span>
          </span>
        </button>
      </div>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            height: '100%',
            backgroundColor: '#080c0a',
            borderLeft: '1px solid #1a241d',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #162019',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0a0e0b',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', color: '#f1f5f9' }}>
                    DROPS CURATOR <span style={{ color: '#10b981', fontSize: '11px' }}>AI</span>
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
                    background: 'transparent',
                    border: '1px solid #27352a',
                    color: '#94a3b8',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#27352a')}
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Chiudi pannello"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
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
              backgroundColor: '#0c120e',
              borderBottom: '1px solid #141c16',
              fontSize: '11px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>⚡ Sessione senza memoria: si azzera alla chiusura della scheda.</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>BRAIN V1</span>
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {messages.length === 0 && !loading && (
                <div style={{
                  padding: '20px 10px',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎧</div>
                  <h4 style={{ color: '#f1f5f9', margin: '0 0 6px 0', fontSize: '15px' }}>Benvenuto nel Radar Underground</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '320px', margin: '0 auto 18px auto' }}>
                    Chiedi selezioni per slot specifici di set, radar sold-out o transizioni armoniche basate sul Canone Drops.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {QUICK_STARTERS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s.prompt)}
                        style={{
                          backgroundColor: '#0f1612',
                          border: '1px solid #1f2a22',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981'
                          e.currentTarget.style.backgroundColor = '#131e17'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1f2a22'
                          e.currentTarget.style.backgroundColor = '#0f1612'
                        }}
                      >
                        <span>{s.label}</span>
                        <span style={{ color: '#10b981', fontSize: '13px' }}>→</span>
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
                      color: isUser ? '#10b981' : '#64748b',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                    }}>
                      {isUser ? 'Tu' : 'Drops Curator'}
                    </div>
                    <div style={{
                      maxWidth: '90%',
                      padding: '12px 14px',
                      borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      backgroundColor: isUser ? '#064e3b' : '#0e1511',
                      border: isUser ? '1px solid #059669' : '1px solid #1b261e',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                    }}>
                      {isUser ? (
                        <div style={{ color: '#f8fafc', fontSize: '13.5px', lineHeight: '1.4' }}>{msg.content}</div>
                      ) : (
                        formatContent(msg.content)
                      )}
                    </div>
                  </div>
                )
              })}

              {loading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#10b981',
                  fontSize: '12.5px',
                  padding: '10px 14px',
                  backgroundColor: '#0d1410',
                  borderRadius: '8px',
                  border: '1px solid #1b281f',
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
                  backgroundColor: '#3f1212',
                  border: '1px solid #7f1d1d',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '12.5px',
                }}>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Phase Chips */}
            <div style={{
              padding: '6px 16px',
              backgroundColor: '#070b09',
              borderTop: '1px solid #131b15',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}>
              {QUICK_PHASE_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(`Sto preparando la fase ${chip}. Che tracce mi consigli?`)}
                  style={{
                    background: '#0d1410',
                    border: '1px solid #1a251e',
                    color: '#94a3b8',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981'
                    e.currentTarget.style.color = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1a251e'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              style={{
                padding: '14px 16px',
                borderTop: '1px solid #162019',
                backgroundColor: '#090d0b',
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
                  backgroundColor: '#0e1511',
                  border: '1px solid #1c2720',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) => (e.target.style.borderColor = '#1c2720')}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  backgroundColor: input.trim() && !loading ? '#10b981' : '#14251c',
                  color: input.trim() && !loading ? '#041d13' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                }}
              >
                Invia
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
