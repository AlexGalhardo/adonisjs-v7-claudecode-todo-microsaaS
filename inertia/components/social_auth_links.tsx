import { GitHubIcon, GoogleIcon } from '~/components/icons'

export default function SocialAuthLinks({ label = 'Continue' }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-gray-6">
        <span className="h-px flex-1 bg-gray-3" />
        or
        <span className="h-px flex-1 bg-gray-3" />
      </div>

      <a
        href="/oauth/google/redirect"
        className="flex h-10 items-center justify-center gap-2 rounded-md border border-gray-4 text-sm font-medium text-gray-12 transition-colors hover:border-gray-6 hover:bg-gray-3"
      >
        <GoogleIcon />
        {label} with Google
      </a>
      <a
        href="/oauth/github/redirect"
        className="flex h-10 items-center justify-center gap-2 rounded-md border border-gray-4 text-sm font-medium text-gray-12 transition-colors hover:border-gray-6 hover:bg-gray-3"
      >
        <GitHubIcon />
        {label} with GitHub
      </a>
    </div>
  )
}
