import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-semibold mb-2">Page Not Found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Where would you like to go?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="font-semibold mb-1">🏠 Home</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Browse featured prompts</div>
            </Link>
            <Link
              href="/browse"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="font-semibold mb-1">🔍 Browse</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Search all prompts</div>
            </Link>
            <Link
              href="/create"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="font-semibold mb-1">✨ Create</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Add a new prompt</div>
            </Link>
            <Link
              href="/packs"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="font-semibold mb-1">📦 Packs</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Buy prompt packs</div>
            </Link>
          </div>
        </div>

        <Link
          href="/browse"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
        >
          Browse All Prompts →
        </Link>
      </div>
    </div>
  );
}



