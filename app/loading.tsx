export default function Loading() {
  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-3 p-4">
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



