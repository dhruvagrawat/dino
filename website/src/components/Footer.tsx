import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-base font-bold tracking-widest text-[#1f2430]">
              {site.name.toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-[#1f2430]/55">
              made with ♥ by {site.studio} · {site.location}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1f2430]/70">
            <Link href="/privacy" className="hover:text-[#1f2430]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#1f2430]">Terms &amp; Conditions</Link>
            <a href={site.github} target="_blank" rel="noopener" className="hover:text-[#1f2430]">GitHub</a>
            <a href={`mailto:${site.email}`} className="hover:text-[#1f2430]">Contact</a>
          </nav>
        </div>
        <p className="mt-8 text-xs text-[#1f2430]/40">
          © {new Date().getFullYear()} {site.author} ({site.studio}). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
