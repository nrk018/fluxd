"use client"

import { useState, useMemo } from "react"

type TrackerEntry = {
  id: string
  application_id: string
  loan_type: string
  amount: number
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'disbursed' | 'completed'
  progress: number
  next_step: string | null
  current_stage: string
  updated_at: string
}

type TrackerTableProps = {
  entries: TrackerEntry[]
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-800 border-yellow-300' },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-800 border-blue-300' },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-800 border-green-300' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-800 border-red-300' },
  disbursed: { label: 'Disbursed', color: 'bg-purple-500/20 text-purple-800 border-purple-300' },
  completed: { label: 'Completed', color: 'bg-gray-500/20 text-gray-800 border-gray-300' },
}

const stages = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'verification', label: 'Verification' },
  { key: 'review', label: 'Review' },
  { key: 'approval', label: 'Approval' },
  { key: 'disbursement', label: 'Disbursement' },
  { key: 'completed', label: 'Completed' },
]

export function TrackerTable({ entries }: TrackerTableProps) {
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof TrackerEntry | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)

  const filteredAndSorted = useMemo(() => {
    let filtered = entries.filter((entry) => {
      const searchLower = search.toLowerCase()
      return (
        entry.application_id.toLowerCase().includes(searchLower) ||
        entry.loan_type.toLowerCase().includes(searchLower)
      )
    })

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortColumn]
        let bVal = b[sortColumn]
        
        if (sortColumn === 'amount') {
          aVal = a.amount
          bVal = b.amount
        } else if (sortColumn === 'updated_at') {
          aVal = new Date(a.updated_at).getTime()
          bVal = new Date(b.updated_at).getTime()
        } else if (sortColumn === 'status') {
          const order = ['pending', 'in_review', 'approved', 'rejected', 'disbursed', 'completed']
          aVal = order.indexOf(a.status)
          bVal = order.indexOf(b.status)
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [entries, search, sortColumn, sortDirection])

  const handleSort = (column: keyof TrackerEntry) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    const diffMonths = Math.floor(diffDays / 30)
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
  }

  const getCurrentStageIndex = (stage: string) => {
    return stages.findIndex(s => s.key === stage)
  }

  return (
    <>
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg p-6 animate-fade-in">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-black">Loan Application Tracker</h2>
          <input
            type="text"
            placeholder="Search by ID or Loan Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 px-4 rounded-md border border-white/30 bg-white/20 backdrop-blur-sm text-sm placeholder:text-black/50 outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-64"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th
                  onClick={() => handleSort('application_id')}
                  className="text-left py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Application ID
                    {sortColumn === 'application_id' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4">Loan Type</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="text-left py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Amount
                    {sortColumn === 'amount' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="text-left py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortColumn === 'status' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('updated_at')}
                  className="text-left py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Last Updated
                    {sortColumn === 'updated_at' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4">Progress</th>
                <th className="text-left py-3 px-4">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-black/60">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{entry.application_id}</td>
                    <td className="py-3 px-4">{entry.loan_type}</td>
                    <td className="py-3 px-4 font-semibold">{formatAmount(entry.amount)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[entry.status].color}`}>
                        {statusConfig[entry.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-black/70">{formatTimeAgo(entry.updated_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                          <div
                            style={{ width: `${entry.progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                          />
                        </div>
                        <span className="text-xs font-medium w-10 text-right">{entry.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black/70">{entry.next_step || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedEntry.application_id}</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-black/60 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-black/60 mb-1">Loan Type</div>
                  <div className="font-semibold">{selectedEntry.loan_type}</div>
                </div>
                <div>
                  <div className="text-xs text-black/60 mb-1">Amount</div>
                  <div className="font-semibold">{formatAmount(selectedEntry.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-black/60 mb-1">Status</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedEntry.status].color}`}>
                    {statusConfig[selectedEntry.status].label}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-black/60 mb-1">Last Updated</div>
                  <div className="text-sm">{formatTimeAgo(selectedEntry.updated_at)}</div>
                </div>
              </div>

              {/* Stage breakdown */}
              <div>
                <div className="text-sm font-semibold mb-4">Application Progress</div>
                <div className="space-y-4">
                  {stages.map((stage, index) => {
                    const currentIndex = getCurrentStageIndex(selectedEntry.current_stage)
                    const isCompleted = index <= currentIndex
                    const isCurrent = index === currentIndex

                    return (
                      <div key={stage.key} className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 text-black/60 border border-white/30'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${isCompleted ? 'text-black' : 'text-black/60'}`}>
                            {stage.label}
                          </div>
                          {isCurrent && selectedEntry.next_step && (
                            <div className="text-xs text-black/50 mt-1">{selectedEntry.next_step}</div>
                          )}
                        </div>
                        {index < stages.length - 1 && (
                          <div className={`absolute left-4 w-0.5 h-8 ${
                            isCompleted ? 'bg-green-500' : 'bg-white/20'
                          }`} style={{ marginTop: '2rem' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-semibold">{selectedEntry.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                  <div
                    style={{ width: `${selectedEntry.progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-800 ease-out"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

