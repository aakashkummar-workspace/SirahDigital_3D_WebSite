import Link from 'next/link';

// Lives at the app root so it also covers paths outside the (site) group.
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 text-center font-sans text-white bg-[#060608]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-blue-400">Error 404</p>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          That page moved.
        </h1>
        <p className="mt-6 text-brand-muted max-w-md mx-auto">
          The site is now split across several pages. Try services, industries, our work, or head back to the start.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full font-medium border transition-all border-white/10 bg-white/5 hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
