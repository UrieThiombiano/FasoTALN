import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { MessageCircle, X, Send, Loader2, Sparkles, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react'

const GREETING = {
  role: 'assistant',
  content: "Bonjour ! Je suis l'assistant de FasoTALN. Posez-moi une question sur le TALN appliqué aux langues africaines (par exemple le mooré, le dioula, le fulfuldé, le gourmantché ou le bambara) ou sur notre contribution de recherche.",
}

const HISTORY_WINDOW = 8

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, open, expanded])

  useEffect(() => {
    if (!open || !expanded) return
    function onKey(e) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, expanded])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const history = messages
      .slice(-HISTORY_WINDOW)
      .filter((m) => !m.isError)
      .map(({ role, content }) => ({ role, content }))

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: err.message, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => {
          setOpen((v) => !v)
          setExpanded(false)
        }}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant FasoTALN"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[72] flex items-center justify-center rounded-full"
        style={{ width: 56, height: 56, background: 'var(--or)', boxShadow: '0 12px 32px rgba(31,33,41,0.24)' }}
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </motion.button>

      <AnimatePresence>
        {open && expanded && (
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(31,33,41,0.32)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={
              expanded
                ? 'fixed inset-0 m-auto z-[71] flex flex-col overflow-hidden rounded-2xl'
                : 'fixed bottom-24 right-6 z-[71] flex flex-col overflow-hidden rounded-2xl'
            }
            style={{
              width: expanded ? 'min(880px, calc(100vw - 2rem))' : 'min(380px, calc(100vw - 2rem))',
              height: expanded ? 'min(820px, calc(100vh - 3rem))' : 'min(560px, calc(100vh - 8rem))',
              background: 'var(--blanc)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(31,33,41,0.24)',
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <Sparkles size={16} color="var(--or-dark)" />
              <span className="font-display font-bold text-sm" style={{ color: 'var(--indigo)' }}>
                Assistant FasoTALN
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-label={expanded ? "Réduire l'assistant" : "Agrandir l'assistant en plein écran"}
                  className="flex items-center justify-center rounded-lg p-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer l'assistant"
                  className="flex items-center justify-center rounded-lg p-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
             <div className={expanded ? 'mx-auto flex w-full max-w-2xl flex-col gap-3' : 'flex flex-col gap-3'}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm"
                    style={{
                      background: m.isError ? 'rgba(234,88,12,0.08)' : m.role === 'user' ? 'var(--or)' : 'var(--sable)',
                      color: m.isError ? 'var(--argile)' : m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {m.isError && <AlertTriangle size={14} className="inline mr-1.5 mb-0.5" />}
                    {m.isError ? (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                    ) : (
                      <div className="chat-markdown">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3.5 py-2.5" style={{ background: 'var(--sable)' }}>
                    <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />
                  </div>
                </div>
              )}
             </div>
            </div>

            <form onSubmit={handleSend} className="border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
             <div className={expanded ? 'mx-auto flex w-full max-w-2xl items-end gap-2 px-3 py-3' : 'flex items-end gap-2 px-3 py-3'}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                disabled={loading}
                rows={1}
                placeholder="Posez votre question…"
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm font-body outline-none"
                style={{ background: 'var(--sable)', border: '1px solid var(--border)', color: 'var(--text-primary)', maxHeight: 96 }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--or)',
                  opacity: !input.trim() || loading ? 0.5 : 1,
                  cursor: !input.trim() || loading ? 'default' : 'pointer',
                }}
              >
                <Send size={16} color="#fff" />
              </button>
             </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
