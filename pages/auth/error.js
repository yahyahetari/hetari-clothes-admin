import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Error() {
  const router = useRouter()
  const { error } = router.query

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred during authentication: {error}</p>
      {error === 'AccessDenied' && (
        <p>
          You are not authorized to access this application. If you believe this is an error, please contact the administrator.
        </p>
      )}
      <Link href="/auth/signin">
        <a>Try signing in again</a>
      </Link>
    </div>
  )
}
