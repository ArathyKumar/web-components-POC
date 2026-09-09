/**
 * Copies PatternFly component CSS from node_modules into JS modules
 * for use with adoptedStyleSheets in shadow DOM buttons.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pfPackageRoot = join(root, 'node_modules/@patternfly/patternfly');
const pfVersion = JSON.parse(
  readFileSync(join(pfPackageRoot, 'package.json'), 'utf8')
).version;

const styleFiles = [
  { source: 'components/Button/button.css', output: 'button-styles.js' },
  { source: 'components/Spinner/spinner.css', output: 'spinner-styles.js' },
  { source: 'components/Badge/badge.css', output: 'badge-styles.js' },
];

for (const { source, output } of styleFiles) {
  const css = readFileSync(join(pfPackageRoot, source), 'utf8');
  const contents = `// Auto-generated from @patternfly/patternfly@${pfVersion}. Run: npm run sync-styles
export default ${JSON.stringify(css)};
`;

  writeFileSync(join(root, 'components', output), contents);
  console.log(`Wrote components/${output}`);
}
