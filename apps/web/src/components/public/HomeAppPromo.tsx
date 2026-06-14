import { Smartphone, Download } from "lucide-react";
import { ANDROID_APK_FILENAME, ANDROID_APK_URL } from "@/lib/app-download";
import { PwaInstallButton } from "@/components/public/PwaInstallButton";

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
          Our native Android app brings attractions, an offline Jugol map,
          itineraries, and guide booking together in one place. iPhone users can
          add Visit Harar to the home screen for a fast, app-like experience
          until the App Store launch.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={ANDROID_APK_URL}
            download={ANDROID_APK_FILENAME}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden />
            Download for Android (APK)
          </a>
          <PwaInstallButton variant="outline-light" className="px-6 py-3" />
          <span className="inline-flex items-center px-6 py-3 rounded-md border border-white/30 text-sm text-white/90">
            App Store — coming soon
          </span>
        </div>
        <p className="mt-6 text-sm text-white/60 max-w-xl mx-auto">
          After downloading on Android, open the file and allow installation from
          your browser if prompted. Play Store listing coming later.
        </p>
      </div>
    </section>
  );
}
