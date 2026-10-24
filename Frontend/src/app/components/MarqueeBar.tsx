'use client';

import { useState } from 'react';

const items = [
  'SAFETY FIRST IN EVERY WORK ACTIVITY',
  'ALWAYS WEAR THE REQUIRED PERSONAL PROTECTIVE EQUIPMENT',
  'REPORT HAZARDS BEFORE THEY BECOME INCIDENTS',
  'FOLLOW OHS PROCEDURES — ZERO ACCIDENT IS OUR GOAL',
  'IDENTIFY RISKS BEFORE STARTING ANY JOB',
  'SAFETY IS NOT AN OPTION — IT IS AN OBLIGATION',
];

export function MarqueeBar() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="bg-[#E5E7EB] py-3 overflow-hidden relative mt-8 opacity-5">
      <div
        className="flex overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            aria-hidden={i === 1 ? true : undefined}
            className="flex gap-10 items-center whitespace-nowrap text-[20px] font-bold italic text-[#F36619] shrink-0"
            style={{
              animation: `marqueeScroll 22s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {items.map((text, idx) => (
              <>
                <span key={idx}>{text}</span>
                <span key={`sep-${idx}`} className="text-[#F36619] px-3">&bull;</span>
              </>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
