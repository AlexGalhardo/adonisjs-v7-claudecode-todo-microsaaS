export default function ServerError() {
  return (
    <div className="flex flex-col items-center gap-2 py-24 text-center">
      <h1 className="text-2xl font-semibold text-gray-12">Something went wrong</h1>
      <p className="text-gray-6">Please try again in a moment.</p>
    </div>
  )
}
