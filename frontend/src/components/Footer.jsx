import mapImg from '../assets/map.png'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row">
        <div className="shrink-0">
          <img
            src={mapImg}
            alt="map"
            className="w-[280px] rounded-2xl border border-white/10 object-cover shadow-xl"
          />
        </div>

        <div className="flex flex-1 flex-wrap justify-between gap-10">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Bulevardi Bill Clinton, Prishtinë</li>
              <li>+383 49 123 456</li>
              <li>business.management@email.com</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Help Center</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Follow Us
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-sm text-slate-500">
        © 2026 Business-Management. All rights reserved.
      </div>
    </footer>
  )
}
