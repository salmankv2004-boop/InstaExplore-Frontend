

export default function FeedSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-64 bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
