export default function Privacy() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Privacy Policy</h1>
      <p className="text-sm text-gray-7">
        We store only what&apos;s needed to run this app: your email, full name, hashed password,
        and the todos you create. We don&apos;t sell or share your data with third parties, other
        than the OAuth providers you choose to sign in with (Google, GitHub).
      </p>
      <p className="text-sm text-gray-7">
        You can delete your account and its data at any time from your profile settings.
      </p>
    </div>
  )
}
