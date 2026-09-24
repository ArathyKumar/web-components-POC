/**
 * Copies the PatternFly CSS modules used by the shadow components into the
 * package source tree so native CSS module imports can use relative URLs.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const patternflyRoot = join(root, 'node_modules/@patternfly/patternfly');

const styles = [
  ['components/Button/button.css', 'components/button/styles/button.css'],
  ['components/Spinner/spinner.css', 'components/button/styles/spinner.css'],
  ['components/Badge/badge.css', 'components/button/styles/badge.css'],
  ['components/Badge/badge.css', 'components/badge/styles/badge.css'],
  ['components/Accordion/accordion.css', 'components/accordion/styles/accordion.css'],
  ['components/Card/card.css', 'components/card/styles/card.css'],
  ['components/Check/check.css', 'components/card/styles/check.css'],
  ['components/Radio/radio.css', 'components/card/styles/radio.css'],
];

for (const [source, destination] of styles) {
  const sourcePath = join(patternflyRoot, source);
  const destinationPath = join(root, destination);

  if (!existsSync(sourcePath)) {
    throw new Error(`copy-patternfly-styles: missing ${sourcePath}`);
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
  console.log(`Copied ${destination}`);
}
