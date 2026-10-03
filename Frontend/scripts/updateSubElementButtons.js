import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Element mapping
const elementMapping = {
  '1': 'komitmen',
  '2': 'rencana-k3',
  '3': 'perancangan-kontrak',
  '4': 'dokumen',
  '5': 'pembelian',
  '6': 'keamanan-kerja',
  '7': 'pemantauan',
  '8': 'pelaporan',
  '9': 'material',
  '10': 'data',
  '11': 'pemeriksaan',
  '12': 'pelatihan'
};

// Find all sub-element pages
const smk3Dir = path.join(__dirname, '../src/app/smk3');
let updatedCount = 0;

for (const [elementNum, elementPath] of Object.entries(elementMapping)) {
  const elementDir = path.join(smk3Dir, elementPath);
  
  if (!fs.existsSync(elementDir)) continue;
  
  const subDirs = fs.readdirSync(elementDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.match(/^\d+-\d+$/));
  
  for (const subDir of subDirs) {
    const pagePath = path.join(elementDir, subDir.name, 'page.tsx');
    
    if (!fs.existsSync(pagePath)) continue;
    
    let content = fs.readFileSync(pagePath, 'utf-8');
    
    // Replace button with Link
    const oldButtonPattern = /<button className="w-full px-4 py-2\.5 bg-\[#f15a22\] text-white font-barlow-condensed font-bold text-\[11px\] tracking-\[0\.08em\] uppercase hover:bg-\[#f7941d\] transition-colors">\s*Kelola Data\s*<\/button>/g;
    
    // Check if Link import exists
    if (!content.includes('import Link from "next/link"')) {
      content = content.replace(
        'import { useEffect } from "react";',
        'import { useEffect } from "react";\nimport Link from "next/link";'
      );
    }
    
    // Replace buttons with Links
    content = content.replace(
      oldButtonPattern,
      (match, offset) => {
        // Find the item.id in context
        const beforeMatch = content.substring(Math.max(0, offset - 500), offset);
        const idMatch = beforeMatch.match(/id:\s*"(\d+\.\d+\.\d+)"/);
        
        if (idMatch) {
          const subSubId = idMatch[1];
          const dashedId = subSubId.replace(/\./g, '-');
          const subDashedId = subDir.name;
          
          return `<Link\n                    href="/smk3/${elementPath}/${subDashedId}/${dashedId}"\n                    className="block w-full px-4 py-2.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors text-center"\n                  >\n                    Kelola Data\n                  </Link>`;
        }
        
        return match;
      }
    );
    
    // Write back
    fs.writeFileSync(pagePath, content);
    updatedCount++;
    console.log(`✓ Updated: ${elementPath}/${subDir.name}/page.tsx`);
  }
}

console.log(`\n✅ Successfully updated ${updatedCount} sub-element pages!`);
