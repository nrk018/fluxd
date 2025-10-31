import Link from "next/link"

export default async function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-400/10">
      <section className="max-w-[1500px] mx-auto px-6 md:px-8 py-10 border-x border-neutral-200">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Loan File #{id}</h1>
          <Link href="/account/files" className="text-sm underline">Back to files</Link>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-sm p-6">
          <p className="text-sm text-black/70">Detailed view placeholder. Hook your data source to render transcript, editable fields, and timeline.</p>
        </div>
      </section>
    </main>
  )
}


