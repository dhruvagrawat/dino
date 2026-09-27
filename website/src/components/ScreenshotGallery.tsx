import Image from "next/image";

const shots = [
  { src: "/screenshots/01-home.jpg", label: "Pick your bot" },
  { src: "/screenshots/02-play.jpg", label: "Neon City by day" },
  { src: "/screenshots/03-night.jpg", label: "…and by night" },
  { src: "/screenshots/04-overdrive.jpg", label: "Overdrive at 2× points" },
  { src: "/screenshots/08-orbit.jpg", label: "Low-gravity Orbit" },
  { src: "/screenshots/05-shop.jpg", label: "Unlock 4 bots" },
  { src: "/screenshots/09-gameover.jpg", label: "Beat your best" },
];

export function ScreenshotGallery() {
  return (
    <section id="screenshots" className="border-y border-black/5 bg-white py-20">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-center font-mono text-2xl font-bold tracking-widest text-[#1f2430]">
          SEE IT IN ACTION
        </h2>
        <p className="mt-3 text-center text-[#1f2430]/55">Swipe to explore the game →</p>
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:px-[max(1.25rem,calc((100%-64rem)/2))]">
        {shots.map((s) => (
          <figure key={s.src} className="snap-center shrink-0">
            <div className="overflow-hidden rounded-[2rem] border-[6px] border-[#1f2430] shadow-xl shadow-black/10">
              <Image
                src={s.src}
                alt={s.label}
                width={216}
                height={384}
                className="block h-auto w-[180px] sm:w-[216px]"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm font-medium text-[#1f2430]/60">
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
