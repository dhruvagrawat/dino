import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { privacyHtml } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description: `Privacy Policy for the ${site.name} app by ${site.studio}.`,
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <Link href="/" className="text-sm font-medium text-[#1f2430]/60 hover:text-[#1f2430]">
          ‹ Back to home
        </Link>
        <article className="legal mt-6" dangerouslySetInnerHTML={{ __html: privacyHtml }} />
      </main>
      <Footer />
    </>
  );
}
