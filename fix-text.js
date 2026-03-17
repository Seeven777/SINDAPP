import fs from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), 'src', 'components');

const replacements = [
  { from: 'text-white/10', to: 'text-[var(--text-main)] opacity-10' },
  { from: 'text-white/20', to: 'text-[var(--text-main)] opacity-20' },
  { from: 'text-white/30', to: 'text-[var(--text-main)] opacity-30' },
  { from: 'text-white/40', to: 'text-[var(--text-main)] opacity-40' },
  { from: 'text-white/50', to: 'text-[var(--text-main)] opacity-50' },
  { from: 'text-white/60', to: 'text-[var(--text-main)] opacity-60' },
  { from: 'text-white/70', to: 'text-[var(--text-main)] opacity-70' },
  { from: 'text-white/80', to: 'text-[var(--text-main)] opacity-80' },
  { from: 'text-white/90', to: 'text-[var(--text-main)] opacity-90' },
  { from: 'text-white', to: 'text-[var(--text-main)]' }
];

function isButtonContext(classStr) {
  // STRICT matching of solid background colored buttons
  const isSolidBg = /\b(bg-primary|bg-blue-[56]00|bg-emerald-[56]00|bg-red-[56]00|bg-green-[56]00|bg-amber-[56]00|from-primary)\b/.test(classStr);
  return isSolidBg;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Only replace if line DOES NOT contain solid button classes
    if (!isButtonContext(line)) {
      for (const rep of replacements) {
        // Regex with boundaries to safely replace utilities class 
        // Example: \btext-white\b or \btext-white/60\b
        // But / is not a word character, so \b doesn't work perfectly after it.
        // We can just use split/join or specific regex
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(?<=['"\\\`\\s])` + escapeRegExp(rep.from) + `(?=['"\\\`\\s]|$)`, 'g');
        line = line.replace(pattern, rep.to);
      }
      lines[i] = line;
    }
  }

  content = lines.join('\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

traverse(DIR);
console.log('Text color replacements complete.');
