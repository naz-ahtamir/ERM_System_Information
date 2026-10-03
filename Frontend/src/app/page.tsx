import { Section, MaxWidth } from "@/app/components/Section";

// --- Gallery data ---
const galleryItems = [
  {
    id: 1,
    category: "Safety Training",
    title: "Safety Training Session",
    date: "Bulan K3 — January 2024",
    colorClass: "bg-[#2a2020]",
  },
  {
    id: 2,
    category: "LOTO Procedure",
    title: "LOTO Procedure Demo",
    date: "OHS Field Inspection — March 2024",
    colorClass: "bg-[#3a2510]",
  },
  {
    id: 3,
    category: "Fire Drill",
    title: "Fire Drill Q1",
    date: "Emergency Response — February 2024",
    colorClass: "bg-[#1a1f2a]",
  },
  {
    id: 4,
    category: "Hazard Inspection",
    title: "Hazard Inspection Round",
    date: "Monthly Inspection — April 2024",
    colorClass: "bg-[#2a1a10]",
  },
  {
    id: 5,
    category: "Safety Award",
    title: "Safety Award Ceremony",
    date: "Annual K3 Award — January 2024",
    colorClass: "bg-[#202a20]",
  },
  {
    id: 6,
    category: "Morning Briefing",
    title: "Morning Safety Briefing",
    date: "Daily Toolbox Talk — May 2024",
    colorClass: "bg-[#231f20]",
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
      <section className="relative w-full h-screen min-h-[600px] bg-gradient-to-br from-[#231f20] to-[#1a1617] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          aria-label="K3 Implementation Video Background"
        >
          <source src="/videos/Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/28 z-1"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f15a22] z-3"></div>

        <div className="relative z-2 text-center px-6 max-w-[900px]">
          {/* <div className="inline-block bg-[#f15a22] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.2em] uppercase px-4 py-1.5 mb-7">
            Emergency Response Management Department
          </div> */}
          <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] mb-6 text-[clamp(39px,7vw,62px)]">
            Life Above All<br />
            <span className="text-[#f7941d]">No Safety No Work</span>
          </h1><br />
          {/* <p className="font-barlow font-normal text-white/85 max-w-[580px] mx-auto mb-10 leading-relaxed text-[clamp(14px,2vw,16px)] tracking-wide">
            Public Safety Reports & Performance KPIs — Transparent since 2019.
            Real data. Real accountability. A safer workplace, every shift.
          </p> */}
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2.5 bg-[#F15A22] text-white font-barlow-condensed font-bold text-sm tracking-[0.12em] uppercase px-8 py-4 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-3 3" />
              </svg>
              View Latest Public Report
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-transparent text-white border-2 border-white/50 font-barlow-condensed font-bold text-sm tracking-[0.12em] uppercase px-8 py-4 rounded-full hover:bg-white/10 hover:border-white hover:scale-[1.02] transition-all duration-300"
            >
              Report a Safety Concern
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-3 flex flex-col items-center gap-2 text-white/50 font-barlow-condensed text-[10px] tracking-[0.15em] uppercase">
          <div className="w-px h-10 bg-[#f15a22] animate-scroll-pulse"></div>
          Scroll
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#f15a22] to-[#f7941d] py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 relative rounded-2xl shadow-xl">
            <div className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full opacity-60 animate-pulse"></div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 mb-4">
              Days Since Last Lost Time Injury
            </div>
            <div className="font-barlow-condensed font-extrabold text-white text-[clamp(42px,6vw,72px)] leading-none mb-2">487</div>
            <div className="font-barlow text-sm text-white/70">consecutive safe days</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 relative rounded-2xl shadow-xl">
            <div className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 mb-4">
              Safe Manhours Achieved
            </div>
            <div className="font-barlow-condensed font-extrabold text-white text-[clamp(42px,6vw,72px)] leading-none mb-2">
              12.45<small className="text-[0.4em] align-super">M</small>
            </div>
            <div className="font-barlow text-sm text-white/70">manhours without LTI — YTD</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 relative rounded-2xl shadow-xl">
            <div className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 mb-4">
              Certified Trainings Completed
            </div>
            <div className="font-barlow-condensed font-extrabold text-white text-[clamp(42px,6vw,72px)] leading-none mb-2">1,280</div>
            <div className="font-barlow text-sm text-white/70">certifications issued YTD</div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE HIGHLIGHTS ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#231f20] to-[#1a1617] py-7 overflow-hidden relative">
        <div className="flex items-center gap-8">
          <span className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#f15a22] whitespace-nowrap shrink-0 bg-black/20 px-3 py-1 ml-10">Latest</span>
          <div className="w-px h-5 bg-[#f7941d]/30 shrink-0"></div>
          
          {/* Marquee Container */}
          <div className="flex overflow-hidden flex-1">
            {/* First Marquee Set */}
            <div className="flex gap-12 items-center whitespace-nowrap" style={{animation: 'marqueeScroll 40s linear infinite'}}>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">National Safety Month Campaign Active</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">BNSP Certification Batch 12 — Completed</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">Emergency Response Drill Q2 — Passed</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">LTIFR: 0.12 — New Record Low</span>
            </div>
            
            {/* Duplicate for seamless loop */}
            <div className="flex gap-12 items-center whitespace-nowrap" aria-hidden="true" style={{animation: 'marqueeScroll 40s linear infinite'}}>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">National Safety Month Campaign Active</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">BNSP Certification Batch 12 — Completed</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">Emergency Response Drill Q2 — Passed</span>
              <span className="text-[#f7941d]">&bull;</span>
              <span className="font-barlow-condensed text-[13px] font-semibold tracking-[0.08em] uppercase text-white">LTIFR: 0.12 — New Record Low</span>
            </div>
          </div>
        </div>
        
        {/* Gradient fades for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#231f20] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#1a1617] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* ─── ABOUT / PHILOSOPHY ───────────────────────────────────────────── */}
      <Section className="bg-[#231f20]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f7941d] mb-4">
              Our Philosophy
            </div>
            <div className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] text-[clamp(32px,4vw,56px)] mb-6">
              Life Above<br />All.<br />No Safety<br />No Work.
            </div>
            <p className="text-[15px] text-[#c5c0bb] leading-relaxed mb-8">
              PT. QMB New Energy Materials is committed to becoming an accomplished enterprise by consistently implementing an Occupational Health and Safety Management System (OHSMS) across all operational stages — ensuring a healthy, safe workplace and full compliance with all applicable laws.
            </p>
            <div className="bg-gradient-to-r from-[#f15a22] to-[#f7941d] p-8 rounded-xl shadow-lg inline-block">
              <div className="font-barlow-condensed text-[18px] font-extrabold uppercase text-white mb-1">Peng Yaguang</div>
              <div className="text-[13px] text-white/75">President Director – PT. QMB New Energy Materials</div>
              <div className="mt-3 text-[13px] text-white/90 italic leading-relaxed">
                "No production target will ever take precedence over the safety and health of our employees."
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { title: "Prevent Accidents & Occupational Diseases", desc: "Enhance stakeholder satisfaction and awareness by preventing workplace accidents and occupational illnesses." },
              { title: "No Safety, No Work", desc: "Apply the concept \u201cLife Above All. No Safety, No Work\u201d and comply with all applicable regulations." },
              { title: "Competent & Professional Workforce", desc: "Develop human resources with OHS culture who are competent and professional." },
              { title: "OHSMS & Continuous Improvement", desc: "Review OHSMS implementation and promote continuous improvement of performance." },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-to-br from-[#2d2929] to-[#1f1b1b] border-l-4 border-l-[#f7941d] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
                <div className="font-barlow-condensed text-[16px] font-bold uppercase text-white mb-2">{item.title}</div>
                <p className="text-[13px] text-[#c5c0bb] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── OHS POLICY ───────────────────────────────────────────────────── */}
      <Section className="bg-[#faf9f7]">
        <div className="mb-14">
          <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
            <span>Official Documents</span>
            <span className="w-10 h-0.5 bg-[#f15a22]"></span>
          </div>
          <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
            Occupational Health and<br />Safety Policy
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Policy */}
          <div className="bg-white/95 backdrop-blur-sm border-t-4 border-t-[#f15a22] shadow-xl p-8 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <span className="font-barlow-condensed text-[20px] font-bold tracking-[0.2em] uppercase text-[#f15a22] block mb-5">
              General Policy
            </span>
            <p className="text-[14px] text-[#231f20] leading-relaxed mb-5 border-l-4 border-l-[#f7941d] pl-4">
              PT. QMB New Energy Materials is dedicated to implementing SMK3 at every stage of work, ensuring high-quality performance, a safe workplace, and full compliance with laws. Therefore, PT. QMB is committed to:
            </p>
            <div className="space-y-3">
              {[
                'Implementing "Life Above All. No Safety, No Work" and complying with all OHS requirements.',
                "Enhancing stakeholder trust by preventing workplace accidents and occupational diseases.",
                "Developing competent, professional, and safety-culture-oriented human resources.",
                "Conducting regular reviews of SMK3 and continuously driving performance improvement.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f15a22] to-[#f7941d] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow">{i + 1}</div>
                  <p className="text-[14px] text-[#6b6560] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Policy */}
          <div className="bg-white/95 backdrop-blur-sm border-t-4 border-t-[#f7941d] shadow-xl p-8 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <span className="font-barlow-condensed text-[20px] font-bold tracking-[0.2em] uppercase text-[#f7941d] block mb-5">
              Specific Policy
            </span>
            <p className="text-[14px] text-[#231f20] leading-relaxed mb-5 border-l-4 border-l-[#f15a22] pl-4">
              PT. QMB is committed to excellence in OHS Management, ensuring a safe and healthy environment for all employees, in compliance with Indonesian laws. Therefore, PT. QMB is committed to:
            </p>
            <div className="space-y-4">
              {[
                "Becoming a workplace free from narcotics, psychotropics, alcoholic beverages, and cigarettes, through prevention programs managed by the P2K3 Committee.",
                "Preventing HIV/AIDS in the workplace and protecting employees from discrimination, in accordance with applicable laws and regulations.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f7941d] to-[#f15a22] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow">{i + 1}</div>
                  <p className="text-[14px] text-[#6b6560] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[#e8e4e0] text-[13px] text-[#6b6560]">
              This policy is communicated to all workers, implemented across every work process, and evaluated regularly by management.
            </div>
          </div>
        </div>
      </Section>

      {/* ─── GALLERY ──────────────────────────────────────────────────────── */}
      <Section className="bg-[#faf9f7]">
        <div className="mb-14">
          <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
            <span>Photo Documentation</span>
            <span className="w-10 h-0.5 bg-[#f15a22]"></span>
          </div>
          <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
            Safety Activities<br />in the Field
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="relative overflow-hidden aspect-[4/3] cursor-pointer group rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className={`w-full h-full ${item.colorClass} flex items-end transition-transform duration-300 group-hover:scale-110 rounded-xl`}></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#f15a22] to-[#f7941d] p-5 translate-y-full transition-transform duration-250 group-hover:translate-y-0 rounded-t-xl">
                <div className="font-barlow-condensed text-[16px] font-bold uppercase text-white mb-1">{item.title}</div>
                <div className="text-[12px] text-white/70">{item.date}</div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="font-barlow-condensed text-[13px] font-bold tracking-[0.1em] uppercase text-white/30 text-center">{item.category}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── DOWNLOADABLE RESOURCES ───────────────────────────────────────── */}
      <Section className="bg-white">
        <div className="mb-14">
          <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
            <span>Downloadable Resources</span>
            <span className="w-10 h-0.5 bg-[#f15a22]"></span>
          </div>
          <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
            Safety<br />Publications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-[#f8f6f4] border-l-4 border-l-[#f15a22] p-8 flex items-center justify-between gap-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div>
                <div className="font-barlow-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">{resource.type}</div>
                <div className="font-barlow-condensed text-[20px] font-bold uppercase text-[#231f20] mb-1">{resource.title}</div>
                <div className="text-[13px] text-[#6b6560]">{resource.meta}</div>
              </div>
              <a
                href={resource.href}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#231f20] to-[#2d2929] text-white border-2 border-transparent font-barlow-condensed font-bold text-[12px] tracking-[0.12em] uppercase px-5 py-3 rounded-full hover:from-[#f15a22] hover:to-[#f7941d] hover:scale-[1.05] transition-all duration-300 whitespace-nowrap shadow"
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
      </Section>

      {/* ─── COMPLIANCE & GOVERNANCE ──────────────────────────────────────── */}
      <Section className="bg-[#231f20]">
        <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f7941d] flex items-center gap-3 mb-4">
          <span>Regulatory Framework</span>
          <span className="w-10 h-0.5 bg-[#f7941d]"></span>
        </div>
        <h2 className="font-barlow-condensed font-extrabold text-white uppercase leading-tight text-[clamp(36px,5vw,60px)] mb-12">
          Compliance &<br />Governance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "PP No. 55 Tahun 2010", desc: "Pembinaan dan Pengawasan Penyelenggaraan Pengelolaan Usaha Pertambangan Mineral dan Batubara — our primary regulatory reference for OHS in mining operations." },
            { label: "ISO 45001:2018", desc: "Occupational Health & Safety Management System certification, integrated with our operational procedures and audited annually by an independent body." },
            { label: "ESG Social Pillar", desc: "Strong OHS performance underpins our Social pillar in ESG, building investor and community trust through transparent public reporting." },
          ].map((item) => (
            <div key={item.label} className="bg-gradient-to-br from-[#2d2929] to-[#1f1b1b] p-8 border-t-[3px] border-t-[#f7941d] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="font-barlow-condensed text-[13px] font-bold tracking-[0.1em] uppercase text-[#f7941d] mb-3">{item.label}</div>
              <p className="text-sm text-[#c5c0bb] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── CTA BAND ─────────────────────────────────────────────────────── */}
      <div className="bg-[#f15a22] py-16 md:py-20 px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-lg">
          <h2 className="font-barlow-condensed font-extrabold text-white uppercase leading-tight text-[clamp(28px,4vw,48px)] mb-2">
            Public KPI Dashboard
          </h2>
          <p className="text-[15px] text-white/80 leading-relaxed">
            Full transparency on our safety performance data — LTIFR, TRIR, manhours, and annual reports available for public access.
          </p>
        </div>
        <a
          href="/dashboard"
          className="bg-[#231f20] text-white font-barlow-condensed font-bold text-sm tracking-[0.12em] uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.05] transition-all duration-300 whitespace-nowrap"
        >
          Access Dashboard
        </a>
      </div>
    </>
  );
}
