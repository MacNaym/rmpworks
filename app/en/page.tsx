import Link from "next/link";

const ventures = [
  { index: "01", name: "Regolario", tag: "AI Literacy", description: "Training, assessment and documentation for companies that need AI literacy to be practical, verifiable and usable.", href: "/projects/regolario", color: "var(--rmp-purple)" },
  { index: "02", name: "ShopShield", tag: "E-commerce compliance", description: "A focused compliance layer for small online businesses that need the essentials without enterprise complexity.", href: "/projects/shopshield", color: "var(--rmp-green)" },
  { index: "03", name: "Tap", tag: "Local business tools", description: "NFC and QR tools that turn a physical customer interaction into a useful digital action in seconds.", href: "/projects/tap", color: "var(--rmp-orange)" },
];

const frame = "mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16";
const purpleHover = "transition hover:text-[var(--rmp-purple)]";

function BrandMark() {
  return (
    <span className="inline-flex h-7 items-end gap-1" aria-hidden>
      <span className="h-3 w-3 -skew-x-12 bg-[var(--rmp-purple)]" />
      <span className="h-5 w-3 -skew-x-12 bg-[var(--rmp-green)]" />
      <span className="h-7 w-3 -skew-x-12 bg-[var(--rmp-orange)]" />
    </span>
  );
}

export default function EnglishHome() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)]">
        <div className={`${frame} flex items-center justify-between py-5`}>
          <Link href="/en/" className="flex items-center gap-3 text-base font-bold tracking-[-0.03em]">
            <BrandMark />
            <span>RMP WORKS</span>
          </Link>
          <div className="flex items-center gap-5 sm:gap-8">
            <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] sm:flex sm:gap-8">
              <Link className={purpleHover} href="/projects">Work</Link>
              <Link className={purpleHover} href="/about">About</Link>
              <Link className={purpleHover} href="/contact">Contact</Link>
            </nav>
            <div className="flex items-center gap-1 rounded-full border border-[var(--line)] p-1 text-xs font-semibold">
              <Link href="/" className="rounded-full px-2.5 py-1 text-[var(--muted)] transition hover:text-[var(--rmp-purple)]">IT</Link>
              <span className="rounded-full bg-[#101010] px-2.5 py-1 text-white">EN</span>
            </div>
          </div>
        </div>
      </header>

      <section className={`${frame} grid min-h-[76vh] content-between py-8 sm:py-12 lg:py-14`}>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--rmp-purple)]" /> Independent product studio
        </div>
        <div className="py-16 sm:py-24 lg:py-28">
          <h1 className="max-w-[1420px] text-[clamp(4rem,9vw,10rem)] font-semibold leading-[0.84] tracking-[-0.075em]">
            We build things<br />that <span className="text-[var(--rmp-orange)]">work.</span>
          </h1>
        </div>
        <div className="grid gap-8 border-t border-[var(--line)] pt-6 md:grid-cols-12">
          <p className="max-w-2xl text-lg leading-7 text-[var(--muted)] md:col-span-7 md:text-xl md:leading-8">RMP Works turns useful ideas into focused products, software and small businesses — quickly, deliberately and without unnecessary layers.</p>
          <div className="flex items-end md:col-span-3 md:col-start-10 md:justify-end">
            <Link href="#work" className="inline-flex items-center gap-3 text-sm font-medium transition hover:text-[var(--rmp-purple)]">See what we are building <span aria-hidden>↓</span></Link>
          </div>
        </div>
      </section>

      <section id="work" className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-8 border-b border-white/20 pb-10 md:grid-cols-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/55 md:col-span-3">Current work</p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:col-span-9 lg:text-7xl">Real products for real problems.</h2>
          </div>
          <div>
            {ventures.map((venture) => (
              <Link href={venture.href} key={venture.name} className="group grid gap-6 border-b border-white/20 py-9 transition hover:border-white/60 md:grid-cols-12 md:items-start">
                <span className="font-mono text-xs md:col-span-1" style={{ color: venture.color }}>{venture.index}</span>
                <div className="md:col-span-4"><p className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{venture.name}</p><p className="mt-2 text-sm text-white/55">{venture.tag}</p></div>
                <p className="max-w-3xl text-base leading-7 text-white/70 md:col-span-5">{venture.description}</p>
                <div className="text-right text-2xl transition-all group-hover:translate-x-1 group-hover:text-[var(--rmp-purple)] md:col-span-2">→</div>
              </Link>
            ))}
          </div>
          <div className="pt-10"><Link href="/projects" className="inline-flex rounded-full border border-white/35 px-5 py-2.5 text-sm transition hover:border-[var(--rmp-purple)] hover:bg-[var(--rmp-purple)] hover:text-white">All projects</Link></div>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28 lg:py-32`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">How we work</p>

        <h2 className="mt-6 max-w-6xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">Small teams.<br />Fast decisions.<br /><span className="text-[var(--rmp-green)]">Useful output.</span></h2>

        <div className="mt-14 grid gap-0 border-y border-[var(--line)] md:grid-cols-3">
          <div className="py-8 md:pr-8"><p className="font-mono text-xs text-[var(--rmp-purple)]">01 / FOCUS</p><p className="mt-4 max-w-md leading-7">Solve one valuable problem before adding ten features nobody asked for.</p></div>
          <div className="border-t border-[var(--line)] py-8 md:border-l md:border-t-0 md:px-8"><p className="font-mono text-xs text-[var(--rmp-green)]">02 / SHIP</p><p className="mt-4 max-w-md leading-7">Put working products in front of real people early and improve from evidence.</p></div>
          <div className="border-t border-[var(--line)] py-8 md:border-l md:border-t-0 md:pl-8"><p className="font-mono text-xs text-[var(--rmp-orange)]">03 / SYSTEMIZE</p><p className="mt-4 max-w-md leading-7">Automate repeatable work so the product can grow without growing bureaucracy with it.</p></div>
        </div>
      </section>

      <section className="bg-[var(--rmp-orange-panel)] text-[#101010]">
        <div className={`${frame} grid min-h-[54vh] content-between py-10 sm:py-14`}>
          <div className="flex items-center gap-3"><span className="h-px w-10 bg-[var(--rmp-purple)]" /><p className="font-mono text-xs uppercase tracking-[0.16em] text-black/55">RMP Works</p></div>
          <div className="py-16 sm:py-20"><h2 className="max-w-7xl text-[clamp(3.5rem,7.5vw,8rem)] font-semibold leading-[0.88] tracking-[-0.07em]">Build the next<br />useful thing.</h2></div>
          <div className="flex flex-col gap-5 border-t border-black/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-black/70">Products, experiments and businesses with a reason to exist.</p>
            <Link href="/contact" className="inline-flex w-fit rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--rmp-purple)]">Get in touch →</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#101010] text-white">
        <div className={`${frame} flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between`}>
          <div><div className="flex items-center gap-3"><BrandMark /><p className="text-lg font-semibold tracking-[-0.03em]">RMP WORKS</p></div><p className="mt-2 text-sm text-white/45">© 2026 RMP Works</p></div>
          <div className="flex items-center gap-6 text-sm text-white/60"><Link className="transition hover:text-[var(--rmp-purple)]" href="/projects">Work</Link><Link className="transition hover:text-[var(--rmp-purple)]" href="/about">About</Link><Link className="transition hover:text-[var(--rmp-purple)]" href="/contact">Contact</Link></div>
        </div>
      </footer>
    </main>
  );
}
