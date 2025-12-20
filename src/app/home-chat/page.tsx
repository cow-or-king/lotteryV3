export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-400">
                Customer Engagement Platform
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                Connect customers.
                <br />
                <span className="text-blue-400">Boost engagement.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-slate-300">
                Avis, likes, newsletter, fidélité.
                <br />
                Une seule plateforme pour transformer chaque interaction client en action mesurable.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-400"
                >
                  Demander une démo
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Voir comment ça marche
                </a>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 blur-3xl" />
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {['⭐ Avis clients', '👍 Likes réseaux', '✉️ Newsletter', '🎁 Fidélité'].map(
                    (item) => (
                      <div key={item} className="rounded-xl bg-slate-800 p-4 text-sm font-medium">
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-t border-slate-900 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm uppercase tracking-wider text-slate-400">
            Trusted by growing brands
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-slate-500">
            <span>Retail</span>
            <span>Hospitality</span>
            <span>Franchises</span>
            <span>E-commerce</span>
            <span>SaaS</span>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">
                Trop d’outils.
                <br />
                Pas assez d’actions.
              </h2>
              <p className="mt-4 text-slate-300">
                Les entreprises multiplient les outils mais perdent l’essentiel : l’engagement réel
                des clients.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-400">
                Une seule connexion.
                <br />
                Plus d’impact.
              </h2>
              <p className="mt-4 text-slate-300">
                Connect & Boost centralise les actions clés et les transforme en expériences
                simples, ludiques et mesurables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold">Tout pour activer vos clients</h2>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Connexion instantanée',
                desc: 'QR codes, mobile & web pour engager en 1 clic.',
              },
              {
                title: 'Actions gamifiées',
                desc: 'Avis, likes, inscriptions, défis.',
              },
              {
                title: 'Récompenses & fidélité',
                desc: 'Incentives clairs et motivants.',
              },
              {
                title: 'Analytics en temps réel',
                desc: 'Suivez chaque action, mesurez l’impact.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold">L’engagement devient un jeu.</h2>
          <p className="mt-4 text-slate-300">
            Roulette, défis, récompenses : chaque action compte.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Prêt à connecter et booster vos clients ?</h2>
          <p className="mt-4 text-slate-300">
            Lancez votre stratégie d’engagement en quelques minutes.
          </p>

          <div className="mt-10">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-400"
            >
              Demander une démo
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <span className="text-sm text-slate-500">
            © {new Date().getFullYear()} Connect & Boost
          </span>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#">Mentions légales</a>
            <a href="#">Confidentialité</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
