/**
 * Page FasoGuide — Agent IA conversationnel sur le Burkina Faso.
 *
 * Structure : header compact fixe / zone de messages scrollable /
 * barre de saisie toujours visible en bas (jamais masquée par le scroll).
 *
 * TODO Claude Code :
 * 2. VoiceInput : enregistrement micro → /api/asr → texte dans le champ
 * 4. Affichage des réponses avec lecture audio si l'agent a généré un TTS
 */

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Bot, Send, Mic } from 'lucide-react'
import BogolonDivider from '../components/ui/BogolonDivider'

const suggestions = [
  "Qui était Thomas Sankara ?",
  "Quoi visiter à Ouagadougou ?",
  "Comment dit-on bonjour en mooré ?",
  "Qu'est-ce que le FESPACO ?",
  "Parlez-moi de la culture Mossi",
  "Quels sont les plats typiques burkinabè ?",
]

const bubbleTransition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] }

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, x: isUser ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={bubbleTransition}
    >
      <div
        className="max-w-[90%] md:max-w-[78%] text-sm leading-relaxed font-body"
        style={{
          padding: '14px 18px',
          background: isUser ? 'var(--argile)' : 'var(--blanc)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          border: isUser ? 'none' : '1px solid var(--border)',
          boxShadow: isUser ? 'none' : '0 2px 8px rgba(26,18,48,0.06)',
        }}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{margin: '0 0 0.5em 0'}}>{children}</p>,
              strong: ({children}) => <strong style={{color: 'var(--argile)', fontWeight: 600}}>{children}</strong>,
              em: ({children}) => <em style={{color: 'var(--text-muted)'}}>{children}</em>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

function ThinkingBubble() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={bubbleTransition}
    >
      <div
        className="flex items-center gap-2 text-sm font-body"
        style={{
          padding: '14px 18px',
          background: 'var(--blanc)',
          color: 'var(--text-muted)',
          borderRadius: '20px 20px 20px 4px',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(26,18,48,0.06)',
        }}
      >
        FasoGuide réfléchit
        <span className="flex gap-0.5" style={{ color: 'var(--argile)', fontSize: 16, lineHeight: 1 }}>
          {[0, 0.15, 0.3].map(delay => (
            <motion.span
              key={delay}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay }}
            >
              •
            </motion.span>
          ))}
        </span>
      </div>
    </motion.div>
  )
}

export default function FasoGuide() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Laafi ! Je suis FasoGuide, votre compagnon de découverte du Burkina Faso. Posez-moi n'importe quelle question sur l'histoire, la culture, les langues ou les lieux du pays."
    }
  ])
  const scrollRef = useRef(null)
  const location = useLocation()
  const [recording, setRecording] = useState(false)
  const [micLang, setMicLang] = useState('fra') // 'fra' ou 'mos'
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  // Scroll automatique vers le bas à chaque nouveau message.
  // On scrolle le conteneur (et non scrollIntoView) : la page contient un
  // footer global sous le bloc 100vh, et scrollIntoView ferait défiler la
  // fenêtre entière, déplaçant la barre de saisie hors de vue.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Question préremplie depuis une autre page (ex. Visite Virtuelle)
  useEffect(() => {
    if (location.state?.question) setInput(location.state.question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Couper micro et flux si l'utilisateur quitte la page en enregistrant
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  function handleSuggestion(q) { setInput(q) }

  async function toggleMic() {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        chunksRef.current = []
        recorder.ondataavailable = e => chunksRef.current.push(e.data)
        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('audio', blob, 'query.webm')
          formData.append('lang', micLang)
          try {
            const res = await fetch('/api/asr', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.transcription) {
              setInput(data.transcription)
              // Envoi automatique : setInput est asynchrone, on passe donc
              // la transcription directement à send().
              send(data.transcription)
            }
          } catch {
            // silencieux
          }
        }
        recorder.start()
        mediaRecorderRef.current = recorder
        setRecording(true)
      } catch {
        alert('Microphone inaccessible. Vérifiez les permissions du navigateur.')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setRecording(false)
    }
  }

  async function send(textOverride) {
    const text = (typeof textOverride === 'string' ? textOverride : input).trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    const currentInput = text
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Je n'ai pas pu répondre. Réessayez." }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion au serveur." }])
    } finally {
      setLoading(false)
    }
  }

  const canSend = input.trim() && !loading

  return (
    <div
      className="mt-16 md:mt-20 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Hero ultra-compact */}
      <div style={{ background: 'var(--indigo)', padding: '1rem 0', flexShrink: 0, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(240,165,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Bot size={20} color="var(--or)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              FasoGuide
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              Posez-moi n'importe quelle question sur le Burkina Faso. Je suis là pour vous guider.
            </p>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <BogolonDivider />
      </div>

      {/* Zone des messages — prend tout l'espace restant */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: 'var(--sable)' }} className="py-4">
        <div className="container-fx max-w-3xl">
          {/* Suggestions initiales en stagger */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {suggestions.map((s, index) => (
                <motion.button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-sm px-4 py-2 rounded-full font-ui transition-colors"
                  style={{
                    background: 'var(--blanc)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...bubbleTransition, delay: index * 0.08 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}

            <AnimatePresence>
              {loading && <ThinkingBubble />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Barre de saisie — toujours visible */}
      <div
        style={{
          flexShrink: 0,
          padding: '0.75rem 1rem',
          background: 'var(--blanc)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="container-fx max-w-3xl">
          <div
            className="flex gap-2 p-3 rounded-2xl"
            style={{
              background: 'var(--blanc)',
              border: '1px solid var(--border)',
              boxShadow: '0 -2px 16px rgba(26,18,48,0.06)',
            }}
          >
            <motion.button
              onClick={toggleMic}
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 40, height: 40,
                background: recording ? 'var(--argile)' : 'var(--sable)',
                color: recording ? '#fff' : 'var(--text-muted)',
              }}
              title={recording ? "Cliquez pour arrêter" : micLang === 'fra' ? "Parler en français" : "Parler en mooré"}
              animate={recording ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={recording ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }}
              whileTap={{ scale: 0.92 }}
            >
              <Mic size={17} />
            </motion.button>
            <button
              onClick={() => setMicLang(l => l === 'fra' ? 'mos' : 'fra')}
              disabled={recording}
              className="flex items-center justify-center rounded-xl flex-shrink-0 font-ui text-xs font-semibold transition-colors"
              style={{
                width: 40, height: 40,
                background: 'var(--sable)',
                color: micLang === 'fra' ? 'var(--mil)' : 'var(--argile)',
                border: '1px solid var(--border)',
                opacity: recording ? 0.5 : 1,
              }}
              title={micLang === 'fra' ? "Langue du micro : français (cliquer pour mooré)" : "Langue du micro : mooré (cliquer pour français)"}
            >
              {micLang === 'fra' ? 'FR' : 'MO'}
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
              placeholder={loading ? "FasoGuide réfléchit..." : "Posez votre question sur le Burkina Faso..."}
              className="flex-1 bg-transparent outline-none text-sm font-body"
              style={{ color: 'var(--text-primary)', opacity: loading ? 0.6 : 1 }}
            />
            <motion.button
              onClick={send}
              disabled={!canSend}
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 40, height: 40,
                background: canSend ? 'var(--or)' : 'var(--sable-dark)',
                color: canSend ? 'var(--indigo)' : 'var(--text-muted)',
                cursor: canSend ? 'pointer' : 'default',
              }}
              animate={canSend ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={canSend ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } : { duration: 0.2 }}
              whileHover={canSend ? { scale: 1.08 } : {}}
              whileTap={canSend ? { scale: 0.94 } : {}}
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
