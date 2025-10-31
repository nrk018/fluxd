"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FilesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) { setRows([]); setLoading(false); return }
      const { data } = await supabase.from('loan_files').select('id, data, status, eligibility_score, confidence').eq('user_id', uid).order('created_at', { ascending: false })
      if (active) setRows(data || [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-400/10">
      <section className="max-w-[1500px] mx-auto px-6 md:px-8 py-10 border-x border-neutral-200">
        <h1 className="text-2xl font-bold mb-6">My Loan Files</h1>
        {loading ? (
          <div className="h-40 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => {
              const type = r.data?.loan?.type || 'Loan File'
              const amount = r.data?.loan?.amount || '—'
              const score = r.eligibility_score ?? 0
              const conf = Math.round((r.confidence ?? 0) * 100)
              return (
                <a key={r.id} href={`/account/files/${r.id}`} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-sm p-4 hover:bg-white/20 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">{type}</div>
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest ${badge(r.status || 'pending')}`}>{r.status || 'pending'}</span>
                  </div>
                  <div className="text-sm text-black/80">Amount: <span className="font-semibold">{amount}</span></div>
                  <div className="text-xs text-black/60 mt-1">Eligibility: {score}% • Confidence: {conf}%</div>
                </a>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function badge(s: string) {
  if (s === 'approved') return 'bg-green-500/20 text-green-800'
  if (s === 'rejected') return 'bg-red-500/20 text-red-800'
  return 'bg-yellow-400/20 text-yellow-800'
}


