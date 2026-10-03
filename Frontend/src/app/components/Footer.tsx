import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#231f20] border-t-[3px] border-t-[#f15a22] pt-12 pb-8 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-16 mb-10">
          <div>
            <div className="font-display font-bold text-lg uppercase text-white tracking-wider mb-4">
              ERM Department
              <span className="block font-normal text-[11px] text-[#c5c0bb] tracking-wider">
                PT. QMB New Energy Materials
              </span>
            </div>
            <p className="text-sm text-[#c5c0bb] max-w-xs leading-relaxed">
              Committed to zero fatality and zero harm across all smelting
              operations. Transparent public reporting since 2019.
            </p>
          </div>
          <div>
            <div className="font-display text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-5">
              Navigation
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  About & Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  Gallery & Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  KPI Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  Report a Concern
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-display text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-5">
              Quick Downloads
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/ohs-policy.pdf"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  OHS Policy Document
                </a>
              </li>
              <li>
                <a
                  href="/annual-report-2024.pdf"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  Annual Report 2024
                </a>
              </li>
              <li>
                <a
                  href="/esg-report-2024.pdf"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  ESG Report 2024
                </a>
              </li>
              <li>
                <a
                  href="/safety-alert.pdf"
                  className="text-sm text-[#c5c0bb] hover:text-white transition"
                >
                  Safety Alert Poster
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#3a3535]">
          <p className="text-xs text-[#6b6560]">
            © 2025 ERM Department. All rights reserved.
          </p>
          <span className="font-display text-[11px] font-bold tracking-wide text-[#f7941d]">
            Compliant: PP No. 55/2010 • ISO 45001:2018
          </span>
        </div>
      </div>
    </footer>
  );
}
