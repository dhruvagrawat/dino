import Link from "next/link";
import { PixelDino } from "./PixelDino";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f7f7]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#16c172]">
            <PixelDino px={1.4} body="#1f2430" />
          </span>
          <span className="font-mono text-lg font-bold tracking-widest text-[#1f2430]">
            {site.name.toUpperCase()}
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-[#1f2430]/70">
          <a href="/#features" className="hidden hover:text-[#1f2430] sm:inline">Features</a>
          <a href="/#about" className="hidden hover:text-[#1f2430] sm:inline">About</a>
          <a
            href="/#download"
            className="rounded-full bg-[#1f2430] px-4 py-2 font-semibold text-white transition hover:opacity-90"
          >
            Get the app
          </a>
        </nav>
      </div>
    </header>
  );
}
