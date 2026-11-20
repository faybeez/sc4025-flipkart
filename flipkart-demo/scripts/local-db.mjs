import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
const cli = 'node_modules/supabase/dist/supabase.js';
function run(args, capture = false) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Error(capture ? 'Local Supabase is unavailable. Run npm run db:setup first.' : 'Supabase command failed.');
  return result.stdout;
}
const mode = process.argv[2];
if (mode === 'setup') {
  run(['start']);
  run(['migration', 'up', '--local']);
}
const status = JSON.parse(run(['status', '-o', 'json'], true));
if (mode === 'setup') {
  const path = '.env.local';
  let existing = ''; try { existing = readFileSync(path, 'utf8'); } catch {}
  existing = existing.split(/\r?\n/).filter(line => !/^NEXT_PUBLIC_SUPABASE_(URL|PUBLISHABLE_KEY|ANON_KEY)=/.test(line)).join('\n').trim();
  writeFileSync(path, `${existing ? existing + '\n' : ''}NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.PUBLISHABLE_KEY || status.ANON_KEY}\n`);
  console.log('Local database ready. Public connection settings saved to .env.local. Restart the app if it is already running.');
}
console.log(`Database API: ${status.API_URL}\nStudio: ${status.STUDIO_URL}`);
