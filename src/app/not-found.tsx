import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
          Page not found
        </h2>
        <p className="text-muted mb-6 font-body">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-body font-medium hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
