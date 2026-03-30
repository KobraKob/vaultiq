import { useState, useCallback } from 'react'
import { UploadCloud, FileText, CheckCircle, Database, X, AlertCircle, File, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx') {
      setMessage({ type: 'error', text: 'Only .PDF and .DOCX files are supported.' })
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be under 10MB.' })
      return
    }
    setFile(f)
    setMessage(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(err.detail || 'Upload failed')
      }

      const data = await response.json()
      setMessage({
        type: 'success',
        text: `"${file.name}" ingested successfully — ${data.details.chunks} chunks added to the knowledge base.`
      })
      setFile(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload document' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-start justify-center p-6 sm:p-8">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Base Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload documents to expand the AI assistant's knowledge base. New documents are merged with existing data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Upload Card */}
          <div className="md:col-span-2 glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              Upload Document
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : file
                      ? 'border-indigo-500/30 bg-indigo-500/5'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="ml-2 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      Drop a file here or <span className="text-indigo-400">browse</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">.PDF or .DOCX up to 10MB</p>
                  </>
                )}
              </div>

              {/* Status Message */}
              {message && (
                <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {message.type === 'success'
                    ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  }
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/10 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload & Index
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
                <Database className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">RAG Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents are automatically split into chunks, embedded with AI, and indexed in the FAISS vector store. New uploads are merged with existing data.
              </p>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <File className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">Supported Formats</h3>
              <div className="flex gap-2 mt-2">
                <span className="text-[11px] font-medium bg-white/5 text-slate-300 px-2 py-1 rounded-md border border-white/10">.PDF</span>
                <span className="text-[11px] font-medium bg-white/5 text-slate-300 px-2 py-1 rounded-md border border-white/10">.DOCX</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
