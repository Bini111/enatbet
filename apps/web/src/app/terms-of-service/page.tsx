import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Enatbet',
  description: 'Terms of service for Enatbet platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            🇪🇹 ENATBET 🇪🇷
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 17, 2024</p>
        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-pink-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
