import Link from "next/link";

const projects = [
  {
    name: "Regolario",
    description:
      "AI literacy verificata e documentata per PMI italiane.",
    href: "/projects/regolario",
  },
  {
    name: "ShopShield",
    description:
      "Compliance semplice per ecommerce e piccole attività online.",
    href: "/projects/shopshield",
  },
  {
    name: "Tap",
    description:
      "Strumenti NFC per trasformare interazioni fisiche in recensioni e azioni online.",
    href: "/projects/tap",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-6 py-24 lg:px-10">
        <p className="mb-6 text-sm uppercase tracking-[0.28em] text-neutral-400">
          RMP Works
        </p>

        <h1 className="max-w-5xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-8xl">
          We build useful things.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400 sm:text-xl">
          Software, tools and small businesses designed to solve real problems
          without unnecessary complexity.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
          >
            Explore our work
          </Link>

          <Link
            href="/about"
            className="rounded-full border border-neutral-700 px-6 py-3 font-medium transition hover:border-neutral-400"
          >
            About RMP Works
          </Link>
        </div>
      </section>

      <section className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
            What we build
          </p>

          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Products, experiments and businesses built around actual problems.
          </h2>
        </div>
      </section>

      <section className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                Ventures
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Current projects
              </h2>
            </div>

            <Link
              href="/projects"
              className="hidden text-sm text-neutral-400 hover:text-white sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl bg-neutral-800 md:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="group bg-neutral-950 p-8 transition hover:bg-neutral-900"
              >
                <h3 className="text-2xl font-semibold">{project.name}</h3>

                <p className="mt-4 leading-7 text-neutral-400">
                  {project.description}
                </p>

                <p className="mt-8 text-sm text-neutral-500 transition group-hover:text-white">
                  Explore →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
              Why RMP Works
            </p>

            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
              Small teams. Fast decisions. Real output.
            </h2>
          </div>

          <div className="max-w-xl space-y-6 text-lg leading-8 text-neutral-400">
            <p>
              RMP Works exists to turn ideas into working products quickly,
              without adding layers of process that do not create value.
            </p>

            <p>
              We focus on useful software, automation and businesses that can
              stand on their own.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="rounded-3xl bg-white px-8 py-14 text-black sm:px-12">
            <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
              RMP Works
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Building the next useful thing.
            </h2>

            <Link
              href="/contact"
              className="mt-10 inline-flex rounded-full bg-black px-6 py-3 font-medium text-white"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>© 2026 RMP Works</span>

          <div className="flex gap-6">
            <Link href="/projects">Projects</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}