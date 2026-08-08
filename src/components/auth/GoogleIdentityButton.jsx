import { useEffect, useRef, useState } from 'react'

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client'

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.querySelector(`script[src="${GIS_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function GoogleIdentityButton({ onCredential, onError, disabled }) {
  const containerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      onError?.('ยังไม่ได้ตั้งค่า VITE_GOOGLE_CLIENT_ID')
      return undefined
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              onError?.('Google ไม่ส่ง ID Token กลับมา')
              return
            }
            onCredential(response.credential)
          },
        })

        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: Math.min(360, containerRef.current.clientWidth || 360),
          logo_alignment: 'left',
        })
        setReady(true)
      })
      .catch(() => onError?.('โหลด Google Identity Services ไม่สำเร็จ'))

    return () => {
      cancelled = true
    }
  }, [onCredential, onError])

  return (
    <div className={disabled ? 'google-identity-wrap disabled' : 'google-identity-wrap'}>
      <div ref={containerRef} />
      {!ready && <div className="google-button-skeleton">กำลังโหลด Google...</div>}
    </div>
  )
}
