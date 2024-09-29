import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { error } = router.query

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Sign In</h1>
      {error === 'OAuthAccountNotLinked' && (
        <p style={{color: 'red'}}>
          To confirm your identity, sign in with the same account you used originally.
        </p>
      )}
      <button onClick={() => signIn('google', { callbackUrl: '/' })}>
        Sign in with Google
      </button>
    </div>
  )
}
