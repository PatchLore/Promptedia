import Link from "next/link";

export const viewport = {
  themeColor: "#000000",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="text-5xl font-bold text-white mb-4">404</h1>
      <p className="text-lg text-gray-400 mb-6">Page not found</p>
      <a
        href="/"
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        Go Home
      </a>
    </div>
  );
}



