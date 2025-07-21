'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase'

function LoginHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    const auth = getAuth(firebaseApp)
    signInWithCustomToken(auth, token)
      .then(() => {
        router.push('/feed')
      })
      .catch((error) => {
        console.error('Login failed:', error)
      })
  }, [searchParams, router])

  return <p>Logging in...</p>
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Preparing login...</p>}>
      <LoginHandler />
    </Suspense>
  )
}
