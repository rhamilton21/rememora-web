'use client'

import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function ShareMemorial({
  memorialId,
  title,
}: {
  memorialId: string
  title?: string
}) {
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = `${baseUrl}/memorial/${memorialId}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title || 'Memorial')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Enlace copiado al portapapeles')
    } catch (err) {
      console.error('Error al copiar:', err)
      alert('No se pudo copiar el enlace')
    }
  }

  const handleDownloadQR = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `memorial-${memorialId}.png`
    a.click()
  }

  return (
    <div className="mb-6 p-3 border rounded bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Compartir este memorial</h3>

      <div className="flex items-center gap-3 flex-wrap mb-3">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 border rounded p-2 text-sm bg-white"
        />
        <button
          onClick={handleCopy}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Copiar enlace
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          {showQR ? 'Ocultar QR' : 'Mostrar QR'}
        </button>
      </div>

      {showQR && (
        <div className="mt-4 flex flex-col items-center">
          <QRCodeCanvas ref={qrRef} value={shareUrl} size={160} includeMargin />
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleDownloadQR}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
            >
              Descargar QR
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Escanea o descarga el código QR
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800"
        >
          Facebook
        </a>
        <a
          href={`mailto:?subject=${encodedTitle}&body=Te%20comparto%20este%20memorial:%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
        >
          Correo
        </a>
      </div>
    </div>
  )
}
