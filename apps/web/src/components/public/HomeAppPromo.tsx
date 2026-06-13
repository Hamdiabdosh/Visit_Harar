import { Smartphone, Download } from "lucide-react";

export function HomeAppPromo() {
  return (
    <section className="py-20 bg-brand text-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <Smartphone className="w-7 h-7" aria-hidden />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold">
          Take Harar with you
        </h2>
        <p className="mt-4 text-white/80 max-w-2xl mx-auto leading-relaxed">
          Our native app for iOS and Android is in development — attractions,
          offline Jugol map, itineraries, and guide booking from one place. Until
          the app store launch, add Visit Harar to your home screen for a
          fast, app-like experience.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/manifest.webmanifest"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden />
            Add to home screen (PWA)
          </a>
          <span className="inline-flex items-center px-6 py-3 rounded-md border border-white/30 text-sm text-white/90">
            App Store & Play Store — coming soon
          </span>
        </div>
      </div>
    </section>
  );
}
