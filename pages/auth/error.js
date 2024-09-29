import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Error() {
  const router = useRouter()
  const { error } = router.query

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred during authentication: {error}</p>
      {error === 'OAuthAccountNotLinked' && (
        <p>
          To confirm your identity, please sign in with the same account you used originally.
        </p>
      )}
      <Link href="/auth/signin">
        <a>Try signing in again</a>
      </Link>
    </div>
  )
}
