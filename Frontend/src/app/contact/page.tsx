import { Section, MaxWidth } from "@/app/components/Section";

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-[calc(72px+64px)] px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <MaxWidth>
          <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-4">
            Safety Complain
          </div>
          <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(48px,7vw,88px)]">
            Safety<br />Complain
          </h1>
        </MaxWidth>
      </div>

      {/* Contact Section */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Get in Touch</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              Contact<br />Us
            </h2>

            <div className="space-y-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f15a22] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                    Office Address
                  </div>
                  <div className="text-[14px] text-[#6b6560] leading-relaxed">
                    Water Treatment Building, 3rd Floor - PT. QMB New Energy Materials<br />
                    Desa Fatufia, Kec. Bahodopi, Kab. Morowali, Provinsi Sulawesi Tengah, 94974
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f15a22] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                    Phone
                  </div>
                  <div className="text-[14px] text-[#6b6560] leading-relaxed">
                    0822-2071-5073 (OHS Hotline)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f15a22] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                    Email
                  </div>
                  <div className="text-[14px] text-[#6b6560] leading-relaxed">
                    nasaruddin@gem.com.cn
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f7941d] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                    Working Hours
                  </div>
                  <div className="text-[14px] text-[#6b6560] leading-relaxed">
                    Monday - Saturday : 07:30 - 17:30 WITA<br />
                    Emergency Hotline: 24/7
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-[#f15a22] p-7 rounded mt-10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="font-barlow-condensed font-bold text-[20px] uppercase text-white">
                  Emergency Contact
                </div>
              </div>
              <p className="text-[14px] text-white/85 mb-4">
                Untuk keadaan darurat, segera hubungi:
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.1em] uppercase mb-2">
                    Emergency Hotline
                  </div>
                  <div className="font-barlow-condensed text-[18px] font-bold text-white">
                    0811-4540-2515
                  </div>
                </div>
                <div>
                  <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.1em] uppercase mb-2">
                    Medical Emergency
                  </div>
                  <div className="font-barlow-condensed text-[18px] font-bold text-white">
                    0811-4540-2498
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Form */}
          <div className="bg-[#ffffff] p-8 rounded">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Report a Concern</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              Report a<br />Concern
            </h2>

            <form className="mt-8 space-y-6">
              <div>
                <label className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block">
                  Report Type
                </label>
                <select className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors">
                  <option value="">Select report type</option>
                  <option value="incident">
                    Near Miss / Incident Report
                  </option>
                  <option value="hazard">Hazard Identification</option>
                  <option value="concern">Safety Concern</option>
                  <option value="suggestion">Safety Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors resize-vertical min-h-[120px]"
                  placeholder="Describe your concern or report..."
                ></textarea>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  className="w-4 h-4 mt-1 border border-[#c5c0bb] accent-[#f15a22]"
                />
                <label htmlFor="anonymous" className="text-[14px] text-[#6b6560]">
                  Report anonymously
                </label>
              </div>

              <button
                type="submit"
                className="block w-full px-6 py-3.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.12em] uppercase border-2 border-[#f15a22] hover:bg-[#231f20] hover:border-[#231f20] transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline mr-2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Submit Report
              </button>

              <div className="flex items-start gap-3 text-[12px] text-[#6b6560]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 text-[#f15a22]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>
                  All reports are treated with confidentiality. We are committed
                  to addressing all safety concerns promptly and thoroughly.
                </span>
              </div>
            </form>
          </div>
        </div>
      </Section>

      {/* Map Section */}
      <section className="bg-[#faf9f7] py-16 md:py-24 px-5 md:px-10">
        <MaxWidth>
          <div className="mb-16">
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] flex items-center gap-3 mb-4">
              <span>Find Us</span>
              <span className="w-10 h-0.5 bg-[#f15a22]"></span>
            </div>
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase leading-tight text-[clamp(32px,4vw,56px)]">
              Our<br />Location
            </h2>
          </div>

          <div className="w-full h-[450px] bg-[#e8e8e8] rounded overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1282.932380393637!2d122.1725910175195!3d-2.859828697515623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sid!4v1777962854603!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="OHS Department Location"
            ></iframe>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
