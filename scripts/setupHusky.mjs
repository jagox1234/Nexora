// Ensures a pre-commit hook exists with lint-staged invocation when Husky can't write directly (sandbox)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const huskyDir = join(process.cwd(), '.husky');
if (!existsSync(huskyDir)) {
  mkdirSync(huskyDir, { recursive: true });
}
const hookPath = join(huskyDir, 'pre-commit');
if (!existsSync(hookPath)) {
  const content = `#!/usr/bin/env sh\n. \\"$(dirname -- \\\"$0\\\")/_/husky.sh\\" 2>/dev/null || true\n\n# Run lint-staged\ncommand -v npx >/dev/null 2>&1 && npx lint-staged || echo 'lint-staged not found'\n`;
  writeFileSync(hookPath, content, { encoding: 'utf8' });
  console.log('[setupHusky] pre-commit hook created');
}
// Ensure shim directory exists
const shimDir = join(huskyDir, '_');
if (!existsSync(shimDir)) mkdirSync(shimDir, { recursive: true });
const shimFile = join(shimDir, 'husky.sh');
if (!existsSync(shimFile)) {
  writeFileSync(shimFile, '#!/usr/bin/env sh\n# Husky shim (lightweight)\ntrue\n', 'utf8');
}
