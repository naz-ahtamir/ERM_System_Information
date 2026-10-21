import { Section, MaxWidth } from "@/app/components/Section";

// --- Gallery data ---
const galleryItems = [
  {
    id: 1,
    category: "Safety Training",
    title: "Safety Training Session",
    date: "Bulan K3 — January 2024",
    bgClass: "from-orange-50 to-orange-100/60",
  },
  {
    id: 2,
    category: "LOTO Procedure",
    title: "LOTO Procedure Demo",
    date: "OHS Field Inspection — March 2024",
    bgClass: "from-gray-50 to-gray-100",
  },
  {
    id: 3,
    category: "Fire Drill",
    title: "Fire Drill Q1",
    date: "Emergency Response — February 2024",
    bgClass: "from-orange-50 to-orange-100/60",
  },
  {
    id: 4,
    category: "Hazard Inspection",
    title: "Hazard Inspection Round",
    date: "Monthly Inspection — April 2024",
    bgClass: "from-gray-50 to-gray-100",
  },
  {
    id: 5,
    category: "Safety Award",
    title: "Safety Award Ceremony",
    date: "Annual K3 Award — January 2024",
    bgClass: "from-orange-50 to-orange-100/60",
  },
  {
    id: 6,
    category: "Morning Briefing",
    title: "Morning Safety Briefing",
    date: "Daily Toolbox Talk — May 2024",
    bgClass: "from-gray-50 to-gray-100",
  },
];

const resources = [
  {
    type: "Safety Communication",
    title: "Safety Alert Poster",
    meta: "PDF • A3 Print-ready • Updated June 2024",
    href: "#",
  },
  {
    type: "Monthly Publication",
    title: "Monthly Safety Bulletin",
    meta: "PDF • Digital Edition • July 2024",
    href: "#",
  },
  {
    type: "Emergency Reference",
    title: "Emergency Response Pocket Guide",
    meta: "PDF • Pocket-sized A6 • Version 3.2",
    href: "#",
  },
  {
    type: "Training Material",
    title: "PPE Selection Guide",
    meta: "PDF • Illustrated Guide • 2024 Edition",
    href: "#",
  },
];

export default function Home() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen min-h-[620px] bg-[#1F2937] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 hero-video opacity-40"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          aria-label="K3 Implementation Video Background"
        >
          <source src="/videos/Video.mp4" type="video/mp4" />
        </video>
        {/* <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/90 via-[#1F2937]/50 to-transparent z-1"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF6B1A] z-3"></div> */}

        <div className="relative z-2 text-center px-6 max-w-[900px]">          
          <h1 className="font-bold text-white leading-tight tracking-tight mb-6 text-[clamp(36px,6vw,64px)]">
            LIFE ABOVE ALL<br />
            <span className="text-[#FF6B1A]">NO SAFETY NO WORK</span>
          </h1>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2.5 bg-[#FF6B1A] text-white font-semibold text-[14px] px-7 py-3.5 rounded-xl shadow-sm hover:bg-[#E85D0F] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-3 3" />
              </svg>
              VIEW LATEST PUBLIC REPORT
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-white text-[#1F2937] border border-[#E5E7EB] font-semibold text-[14px] px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-xs"
            >
              REPORT A SAFETY CONCERN
            </a>
          </div>
        </div>

        {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-3 flex flex-col items-center gap-2 text-white/50 text-[11px] font-semibold tracking-widest uppercase">
          <div className="w-px h-8 bg-[#FF6B1A] animate-scroll-pulse"></div>
          Scroll
        </div> */}
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-[#E5E7EB]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#6B7280]">
                Days Since Last Lost Time Injury
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="font-bold text-[#1F2937] text-[clamp(40px,5vw,56px)] leading-none mb-2">487</div>
            <div className="text-[13px] text-[#6B7280]">consecutive safe days</div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#6B7280]">
                Safe Manhours Achieved
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A] animate-pulse"></span>
            </div>
            <div className="font-bold text-[#FF6B1A] text-[clamp(40px,5vw,56px)] leading-none mb-2">
              12.45<small className="text-[0.45em] text-[#1F2937] align-super">M</small>
            </div>
            <div className="text-[13px] text-[#6B7280]">manhours without LTI — YTD</div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#6B7280]">
                Certified Trainings Completed
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="font-bold text-[#1F2937] text-[clamp(40px,5vw,56px)] leading-none mb-2">1,280</div>
            <div className="text-[13px] text-[#6B7280]">certifications issued YTD</div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE HIGHLIGHTS ───────────────────────────────────────────── */}
      <div className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 overflow-hidden relative">
        <div className="flex items-center gap-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#FF6B1A] whitespace-nowrap shrink-0 bg-[#FFF1E8] border border-[#FF6B1A]/20 px-3 py-1 rounded-md ml-8">
            Latest
          </span>
          <div className="w-px h-4 bg-[#E5E7EB] shrink-0"></div>
          
          {/* Marquee Container */}
          <div className="flex overflow-hidden flex-1">
            <div className="flex gap-12 items-center whitespace-nowrap text-[13px] font-medium text-[#1F2937]" style={{animation: 'marqueeScroll 40s linear infinite'}}>
              <span>National Safety Month Campaign Active</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span>BNSP Certification Batch 12 — Completed</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span>Emergency Response Drill Q2 — Passed</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span className="font-semibold text-[#FF6B1A]">LTIFR: 0.12 — New Record Low</span>
            </div>
            
            <div className="flex gap-12 items-center whitespace-nowrap text-[13px] font-medium text-[#1F2937]" aria-hidden="true" style={{animation: 'marqueeScroll 40s linear infinite'}}>
              <span>National Safety Month Campaign Active</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span>BNSP Certification Batch 12 — Completed</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span>Emergency Response Drill Q2 — Passed</span>
              <span className="text-[#FF6B1A]">&bull;</span>
              <span className="font-semibold text-[#FF6B1A]">LTIFR: 0.12 — New Record Low</span>
            </div>
          </div>
        </div>
        
        {/* Gradient fades for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* ─── ABOUT / PHILOSOPHY ───────────────────────────────────────────── */}
      <Section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-3">
              Our Philosophy
            </div>
            <div className="font-bold text-[#1F2937] leading-tight text-[clamp(28px,3.5vw,46px)] mb-6">
              Life Above All.<br />
              <span className="text-[#FF6B1A]">No Safety No Work.</span>
            </div>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-8">
              PT. QMB New Energy Materials is committed to becoming an accomplished enterprise by consistently implementing an Occupational Health and Safety Management System (OHSMS) across all operational stages — ensuring a healthy, safe workplace and full compliance with all applicable laws.
            </p>
            {/* <div className="bg-[#FFF1E8] border border-[#FF6B1A]/20 p-7 rounded-2xl shadow-xs">
              <div className="font-bold text-[16px] text-[#1F2937] mb-0.5">Peng Yaguang</div>
              <div className="text-[13px] text-[#6B7280]">President Director – PT. QMB New Energy Materials</div>
              <div className="mt-3 text-[14px] text-[#1F2937] italic leading-relaxed border-l-2 border-[#FF6B1A] pl-3">
                &ldquo;No production target will ever take precedence over the safety and health of our employees.&rdquo;
              </div>
            </div> */}
          </div>

          <div className="space-y-3">
            {[
              { title: "Prevent Accidents & Occupational Diseases", desc: "Enhance stakeholder satisfaction and awareness by preventing workplace accidents and occupational illnesses." },
              { title: "No Safety, No Work", desc: "Apply the concept “Life Above All. No Safety, No Work” and comply with all applicable regulations." },
              { title: "Competent & Professional Workforce", desc: "Develop human resources with OHS culture who are competent and professional." },
              { title: "OHSMS & Continuous Improvement", desc: "Review OHSMS implementation and promote continuous improvement of performance." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs hover:border-[#FF6B1A] transition-all">
                <div className="font-semibold text-[15px] text-[#1F2937] mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A]"></span>
                  {item.title}
                </div>
                <p className="text-[13px] text-[#6B7280] leading-relaxed pl-3.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── OHS POLICY ───────────────────────────────────────────────────── */}
      <Section className="bg-[#FAFAFA] border-t border-[#E5E7EB]">
        <div className="mb-12">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] flex items-center gap-2 mb-3">
            <span>Official Documents</span>
            <span className="w-8 h-0.5 bg-[#FF6B1A]"></span>
          </div>
          <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(28px,3.5vw,44px)]">
            Occupational Health and Safety Policy
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Policy */}
          <div className="bg-white border border-[#E5E7EB] shadow-xs p-8 rounded-2xl">
            <span className="inline-block px-3 py-1 rounded-md bg-[#FFF1E8] text-[#FF6B1A] text-[12px] font-bold tracking-wider uppercase mb-5">
              General Policy
            </span>
            <p className="text-[14px] text-[#1F2937] leading-relaxed mb-6 pl-4 border-l-2 border-[#FF6B1A]">
              PT. QMB New Energy Materials is dedicated to becoming an outstanding company by consistently and sustainably implementing the Occupational Safety and Health Management System (SMK3) at every stage of work to ensure the highest quality of performance, create a healthy and safe workplace for all employees, and guarantee compliance with all applicable laws and regulations. Therefore, PT. QMB New Energy Materials is committed to:
            </p>
            <div className="space-y-4">
              {[
                "Implementing the company's safety concept, 'Life Above All. No Safety, No Work,' and complying with laws, regulations, and other applicable requirements related to occupational safety and health.",
                "Enhancing stakeholder satisfaction and concern by striving to prevent workplace accidents and occupational diseases.",
                "Developing competent, professional, and safety-culture-oriented human resources.",
                "Conducting regular reviews of the implementation of the Occupational Safety and Health Management System (SMK3) and consistently encouraging performance improvement.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#FF6B1A]/20">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-[#1F2937] leading-relaxed mt-6 pl-4 border-l-2 border-[#FF6B1A]">
                This General Policy shall be understood by and communicated to all employees, and shall be reviewed to ensure its continuing alignment with the company's needs.
            </p>            
          </div>

          {/* Specific Policy */}
          <div className="bg-white border border-[#E5E7EB] shadow-xs p-8 rounded-2xl">
            <span className="inline-block px-3 py-1 rounded-md bg-[#FFF1E8] text-[#FF6B1A] text-[12px] font-bold tracking-wider uppercase mb-5">
              Specific Policy
            </span>
            <p className="text-[14px] text-[#1F2937] leading-relaxed mb-6 pl-4 border-l-2 border-[#FF6B1A]">
              PT. QMB New Energy Materials is committed to becoming an outstanding company by consistently and continuously implementing the Occupational Safety and Health Management System at every work process, ensuring the creation of a safe and healthy working environment for all workers, and complying with all applicable laws and regulations of the Republic of Indonesia. Therefore, PT. QMB New Energy Materials is committed to:
            </p>
            <div className="space-y-4">
              {[
                "Becoming a company free from the abuse of narcotics, psychotropic substances, addictive substances, alcoholic beverages, and cigarettes in the workplace, by implementing prevention and mitigation programs and assigning the P2K3 (Occupational Safety and Health Committee) as the party responsible for the program.",
                "Undertaking efforts to prevent the spread of HIV/AIDS in the workplace, and providing protection to workers with HIV/AIDS from discriminatory acts and treatment, in accordance with applicable laws and regulations.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF1E8] text-[#FF6B1A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#FF6B1A]/20">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-[#1F2937] leading-relaxed mt-6 pl-4 border-l-2 border-[#FF6B1A]">
              This Specific Policy shall be understood by all workers, communicated and implemented in every work process, and shall be evaluated by management for continuous improvement.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── GALLERY ──────────────────────────────────────────────────────── */}
      <Section className="bg-white border-t border-[#E5E7EB]">
        <div className="mb-12">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] flex items-center gap-2 mb-3">
            <span>Photo Documentation</span>
            <span className="w-8 h-0.5 bg-[#FF6B1A]"></span>
          </div>
          <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(28px,3.5vw,44px)]">
            Safety Activities in the Field
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs hover:shadow-md transition-all">
              <div className={`w-full aspect-[4/3] bg-gradient-to-br ${item.bgClass} flex items-center justify-center relative p-6 transition-transform duration-300 group-hover:scale-105`}>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] px-3 py-1 bg-white/80 rounded-md border border-[#E5E7EB] shadow-2xs">
                  {item.category}
                </span>
              </div>
              <div className="p-5 border-t border-[#E5E7EB] bg-white">
                <div className="font-semibold text-[15px] text-[#1F2937] mb-1 group-hover:text-[#FF6B1A] transition-colors">{item.title}</div>
                <div className="text-[12px] text-[#6B7280]">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── DOWNLOADABLE RESOURCES ───────────────────────────────────────── */}
      {/* <Section className="bg-[#FAFAFA] border-t border-[#E5E7EB]">
        <div className="mb-12">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] flex items-center gap-2 mb-3">
            <span>Downloadable Resources</span>
            <span className="w-8 h-0.5 bg-[#FF6B1A]"></span>
          </div>
          <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(28px,3.5vw,44px)]">
            Safety Publications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs flex items-center justify-between gap-6 hover:border-[#FF6B1A] transition-all">
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#FF6B1A] mb-1.5">{resource.type}</div>
                <div className="font-bold text-[16px] text-[#1F2937] mb-1">{resource.title}</div>
                <div className="text-[12px] text-[#6B7280]">{resource.meta}</div>
              </div>
              <a
                href={resource.href}
                className="inline-flex items-center gap-2 bg-[#FAFAFA] hover:bg-[#FFF1E8] text-[#1F2937] hover:text-[#FF6B1A] border border-[#E5E7EB] hover:border-[#FF6B1A]/40 font-semibold text-[12px] px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-2xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </a>
            </div>
          ))}
        </div>
      </Section> */}

      {/* ─── COMPLIANCE & GOVERNANCE ──────────────────────────────────────── */}
      {/* <Section className="bg-white border-t border-[#E5E7EB]">
        <div className="mb-12">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] flex items-center gap-2 mb-3">
            <span>Regulatory Framework</span>
            <span className="w-8 h-0.5 bg-[#FF6B1A]"></span>
          </div>
          <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(28px,3.5vw,44px)]">
            Compliance &amp; Governance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "PP No. 50 Tahun 2012", desc: "Pembinaan dan Pengawasan Penyelenggaraan Pengelolaan Usaha Pertambangan Mineral dan Batubara — our primary regulatory reference for OHS in mining operations." },
            { label: "ISO 45001:2018", desc: "Occupational Health & Safety Management System certification, integrated with our operational procedures and audited annually by an independent body." },
            { label: "ESG Social Pillar", desc: "Strong OHS performance underpins our Social pillar in ESG, building investor and community trust through transparent public reporting." },
          ].map((item) => (
            <div key={item.label} className="bg-[#FAFAFA] border border-[#E5E7EB] p-7 rounded-2xl shadow-xs hover:border-[#FF6B1A] transition-all">
              <div className="inline-block px-2.5 py-1 rounded bg-[#FFF1E8] border border-[#FF6B1A]/20 text-[12px] font-bold text-[#FF6B1A] mb-4">
                {item.label}
              </div>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section> */}

      {/* ─── CTA BAND ─────────────────────────────────────────────────────── */}
      {/* <div className="bg-[#FFF1E8] border-t border-b border-[#FF6B1A]/20 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="font-bold text-[#1F2937] leading-tight text-[clamp(24px,3vw,36px)] mb-2">
              Public KPI Dashboard
            </h2>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Full transparency on our safety performance data — LTIFR, TRIR, manhours, and annual reports available for public access.
            </p>
          </div>
          <a
            href="/dashboard"
            className="bg-[#FF6B1A] hover:bg-[#E85D0F] text-white font-semibold text-[14px] px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          >
            Access Dashboard
          </a>
        </div>
      </div> */}
    </>
  );
}
