import { existsSync, readFileSync } from 'fs';
import path from 'path';

const appRoot = path.join(process.cwd(), 'src/app');

function readAppFile(relativePath: string) {
  return readFileSync(path.join(appRoot, relativePath), 'utf8');
}

describe('ad surfaces', () => {
  it('does not wire AdSense scripts or slots into shared layouts', () => {
    const sharedLayouts = [
      'layout.tsx',
      'components/GoogleAnalytics.tsx',
      'tools/layout.tsx',
      'new/tools/layout.tsx',
      'stable/tools/layout.tsx',
    ];

    for (const relativePath of sharedLayouts) {
      const source = readAppFile(relativePath);

      expect(source).not.toMatch(/AdScriptManager|AdSlot|AdManager|adsbygoogle|googlesyndication|NEXT_PUBLIC_ADSENSE/);
    }
  });

  it('does not keep standalone ad runtime components', () => {
    const removedAdComponents = [
      'components/AdManager.ts',
      'components/AdScriptManager.tsx',
      'components/AdSlot.tsx',
    ];

    for (const relativePath of removedAdComponents) {
      expect(existsSync(path.join(appRoot, relativePath))).toBe(false);
    }
  });
});
