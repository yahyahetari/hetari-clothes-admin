import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router])

  const handleSignIn = async () => {
    const result = await signIn('google', { 
      callbackUrl: '/',
      redirect: false
    });
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      router.push(result.url);
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Sign In</h1>
      {error && (
        <p style={{color: 'red'}}>
          {error === 'AccessDenied' 
            ? 'You are not authorized to access this application.'
            : `An error occurred: ${error}`}
        </p>
      )}
      <button onClick={handleSignIn}>
        Sign in with Google
      </button>
    </div>
  )
}
