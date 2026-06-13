import Image from "next/image";

const shots = [
  { src: "/screenshots/01-home.jpg", label: "Home & your runner" },
  { src: "/screenshots/02-play.jpg", label: "Endless gameplay" },
  { src: "/screenshots/03-gameover.jpg", label: "Beat your best" },
  { src: "/screenshots/04-shop.jpg", label: "Unlock 3 dinos" },
  { src: "/screenshots/05-skins.jpg", label: "5 collectible skins" },
  { src: "/screenshots/06-icon.jpg", label: "Tap to play" },
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
                height={480}
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
