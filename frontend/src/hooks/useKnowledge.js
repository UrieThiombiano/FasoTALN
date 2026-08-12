import { useEffect, useState } from 'react'

export default function useKnowledge(category, { isList = true } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/knowledge/${category}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((json) => { if (!cancelled) setData(json) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [category])

  const fallback = isList ? [] : null
  return { data: data ?? fallback, loading, error }
}
