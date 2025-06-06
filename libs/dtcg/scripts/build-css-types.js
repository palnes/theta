import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const cssTypesPath = './dist/css.d.ts';
const cssTypes = `declare module '@theta/tokens/css' {
  const content: string;
  export default content;
}
`;

mkdirSync(dirname(cssTypesPath), { recursive: true });
writeFileSync(cssTypesPath, cssTypes);
console.log('Created css.d.ts in dist folder');
