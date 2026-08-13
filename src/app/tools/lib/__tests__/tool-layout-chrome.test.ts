import { shouldShowGlobalToolHeader } from '../tool-layout-chrome';

describe('tool layout chrome', () => {
  it('keeps the API workbench in full-screen product mode', () => {
    expect(shouldShowGlobalToolHeader('/tools/api')).toBe(false);
    expect(shouldShowGlobalToolHeader('/tools/api/')).toBe(false);
    expect(shouldShowGlobalToolHeader('/tools/api?tab=request')).toBe(false);
  });

  it('keeps normal navigation on utility tool pages', () => {
    expect(shouldShowGlobalToolHeader('/tools/json')).toBe(true);
    expect(shouldShowGlobalToolHeader('/tools/all')).toBe(true);
  });
});
