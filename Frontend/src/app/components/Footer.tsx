import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t border-[#E5E7EB] pt-14 pb-8 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-16 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              {/* <div className="w-8 h-8 rounded-lg bg-[#FF6B1A] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                K3
              </div> */}
              <span className="font-bold text-base text-[#1F2937] tracking-tight">ERM DEPARTMENT</span>
            </div>
            <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider mb-3">
              PT. QMB New Energy Materials
            </p>
            {/* <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed">
              Live above all. No Safety, No Work.              
            </p> */}
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[#FF6B1A] mb-4">
              Navigation
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  About & Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  Gallery & Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  KPI Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  Report a Concern
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[#FF6B1A] mb-4">
              Quick Downloads
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/ohs-policy.pdf"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  OHS Policy Document
                </a>
              </li>
              <li>
                <a
                  href="/annual-report-2024.pdf"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  Annual Report 2024
                </a>
              </li>
              <li>
                <a
                  href="/esg-report-2024.pdf"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  ESG Report 2024
                </a>
              </li>
              <li>
                <a
                  href="/safety-alert.pdf"
                  className="text-sm text-[#4B5563] hover:text-[#FF6B1A] transition-colors"
                >
                  Safety Alert Poster
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280]">
            © 2026 ERM Department. All rights reserved.
          </p>
          {/* <span className="text-xs font-semibold tracking-wide text-[#6B7280]">
            Compliant: <span className="text-[#FF6B1A]">PP No. 50/2012 • ISO 45001:2018</span>
          </span> */}
        </div>
      </div>
    </footer>
  );
}
