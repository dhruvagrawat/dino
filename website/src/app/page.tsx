import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PixelDino } from "@/components/PixelDino";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { features, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="ground-grid relative overflow-hidden border-b border-black/5">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:py-28">
          <span className="mb-7 grid place-items-center rounded-[2rem] bg-[#16c172] p-7 shadow-xl shadow-[#16c172]/30">
            <PixelDino px={6} body="#1f2430" />
          </span>
          <h1 className="font-mono text-5xl font-extrabold tracking-tight text-[#1f2430] sm:text-7xl">
            {site.name.toUpperCase()}
          </h1>
          <p className="mt-3 font-mono text-sm tracking-[0.3em] text-[#1f2430]/50 sm:text-base">
            {site.tagline}
          </p>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#1f2430]/70">
            {site.description}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#download"
              className="rounded-2xl bg-[#1f2430] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              ▶ Get the app
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener"
              className="rounded-2xl border-2 border-[#1f2430]/15 px-8 py-4 text-base font-semibold text-[#1f2430] transition hover:border-[#1f2430]/40"
            >
              View source
            </a>
          </div>
          <p className="mt-5 text-xs font-medium uppercase tracking-wider text-[#1f2430]/40">
            Free · No ads · 100% offline
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center font-mono text-2xl font-bold tracking-widest text-[#1f2430]">
          WHAT&apos;S INSIDE
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-[#1f2430]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1f2430]/65">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS */}
      <ScreenshotGallery />

      {/* DOWNLOAD */}
      <section id="download" className="border-y border-black/5 bg-[#16c172]/10">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <h2 className="font-mono text-2xl font-bold tracking-widest text-[#1f2430]">GET DINO</h2>
          <p className="mx-auto mt-3 max-w-md text-[#1f2430]/65">
            Coming soon to the Google Play Store. Built with Expo &amp; React Native.
          </p>
          <div className="mt-8 flex justify-center">
            {site.playStoreUrl ? (
              <a
                href={site.playStoreUrl}
                target="_blank"
                rel="noopener"
                className="rounded-2xl bg-[#1f2430] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                ▶ Get it on Google Play
              </a>
            ) : (
              <span className="rounded-2xl border-2 border-dashed border-[#1f2430]/25 px-8 py-4 text-base font-semibold text-[#1f2430]/50">
                Google Play — coming soon
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT / CONTACT */}
      <section id="about" className="mx-auto max-w-5xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-mono text-2xl font-bold tracking-widest text-[#1f2430]">ABOUT</h2>
            <p className="mt-5 leading-relaxed text-[#1f2430]/70">
              {site.name} is an indie passion project by{" "}
              <span className="font-semibold text-[#1f2430]">{site.author}</span> under the{" "}
              <span className="font-semibold text-[#1f2430]">{site.studio}</span> label — a love
              letter to the classic Chrome dino game, rebuilt with modern polish, unlockables and
              extra modes. No tracking, no servers, just a fun runner that respects your privacy.
            </p>
          </div>
          <div>
            <h2 className="font-mono text-2xl font-bold tracking-widest text-[#1f2430]">CONTACT</h2>
            <ul className="mt-5 space-y-3 text-[#1f2430]/75">
              <li>
                <span className="text-[#1f2430]/45">Email · </span>
                <a className="font-medium underline hover:text-[#1f2430]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
              <li>
                <span className="text-[#1f2430]/45">Phone · </span>
                <a className="font-medium underline hover:text-[#1f2430]" href={`tel:${site.phone}`}>
                  {site.phone}
                </a>
              </li>
              <li>
                <span className="text-[#1f2430]/45">GitHub · </span>
                <a
                  className="font-medium underline hover:text-[#1f2430]"
                  href={site.githubUser}
                  target="_blank"
                  rel="noopener"
                >
                  @dhruvagrawat
                </a>
              </li>
              <li>
                <span className="text-[#1f2430]/45">Based in · </span>
                {site.location}
              </li>
            </ul>
            <div className="mt-6 flex gap-3 text-sm">
              <Link
                href="/privacy"
                className="rounded-full border border-black/10 px-4 py-2 font-medium text-[#1f2430]/70 hover:text-[#1f2430]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-full border border-black/10 px-4 py-2 font-medium text-[#1f2430]/70 hover:text-[#1f2430]"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
