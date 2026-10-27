'use client';

import { useState } from 'react';

const items = [
  '力行环保',
  'PROTECT THE ENVIRONMENT',
  '造福人类',
  'BENEFIT HUMANITY',
  '得道多助',
  'RIGHTEOUSNESS DRAWS ABUNDANT SUPPORT',
];

export function MarqueeBar() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="bg-[#FAFAFA] py-3 overflow-hidden relative mt-8">
      <div
        className="flex overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            aria-hidden={i === 1 ? true : undefined}
            className="flex gap-10 items-center whitespace-nowrap text-[33px] font-bold italic text-[#F36619] shrink-0"
            style={{
              animation: `marqueeScroll 11s linear infinite`,
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
