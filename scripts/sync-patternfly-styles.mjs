/**
 * Copies PatternFly component CSS from node_modules into component style modules.
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
  {
    source: 'components/Button/button.css',
    output: 'components/button/styles/button-styles.js',
  },
  {
    source: 'components/Spinner/spinner.css',
    output: 'components/button/styles/spinner-styles.js',
  },
  {
    source: 'components/Badge/badge.css',
    output: 'components/button/styles/badge-styles.js',
  },
  {
    source: 'components/Accordion/accordion.css',
    output: 'components/accordion/styles/accordion-styles.js',
  },
];

for (const { source, output } of styleFiles) {
  const css = readFileSync(join(pfPackageRoot, source), 'utf8');
  const contents = `// Auto-generated from @patternfly/patternfly@${pfVersion}. Run: npm run sync-styles
export default ${JSON.stringify(css)};
`;

  writeFileSync(join(root, output), contents);
  console.log(`Wrote ${output}`);
}
