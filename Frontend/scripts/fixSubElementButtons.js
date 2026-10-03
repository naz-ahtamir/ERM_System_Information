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
    
    // Pattern untuk button yang perlu diganti
    const buttonPattern = /<button className="w-full px-4 py-2\.5 bg-\[#f15a22\] text-white font-barlow-condensed font-bold text-\[11px\] tracking-\[0\.08em\] uppercase hover:bg-\[#f7941d\] transition-colors">\s*Kelola Data\s*<\/button>/g;
    
    // Cek apakah ada button yang perlu diganti
    if (!buttonPattern.test(content)) {
      console.log(`⊘ Skipped: ${elementPath}/${subDir.name} (no buttons to replace)`);
      continue;
    }
    
    // Reset regex
    buttonPattern.lastIndex = 0;
    
    // Replace dengan Link yang dinamis
    const newContent = content.replace(
      buttonPattern,
      `<Link
                  href={\`/smk3/${elementPath}/${subDir.name}/\${item.id.replace(/\\./g, '-')}\`}
                  className="block w-full px-4 py-2.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors text-center"
                >
                  Kelola Data
                </Link>`
    );
    
    // Write back
    fs.writeFileSync(pagePath, newContent);
    updatedCount++;
    console.log(`✓ Updated: ${elementPath}/${subDir.name}`);
  }
}

console.log(`\n✅ Successfully updated ${updatedCount} sub-element pages!`);
