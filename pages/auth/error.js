import { useRouter } from 'next/router'

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
          <br />
          <a href="/auth/signin">Try signing in again</a>
        </p>
      )}
    </div>
  )
}
