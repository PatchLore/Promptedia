import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        There was an error signing you in. Please try again.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-block"
      >
        Return Home
      </Link>
    </div>
  );
}



