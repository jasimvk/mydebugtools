import {
  getFeaturedTools,
  liveTools,
  proposedTools,
  publicTools,
  toolPillars,
} from '../tool-registry';

describe('tool registry IA', () => {
  it('promotes the debugging flagships before the full catalog', () => {
    expect(getFeaturedTools().map((tool) => tool.name)).toEqual([
      'API Workbench',
      'Stack Trace Explainer',
      'Log Trace Rebuilder',
      'HTTP Traffic Inspector',
      'Security Headers Inspector',
      'JSON Tools',
    ]);
  });

  it('exposes every live tool in the public catalog', () => {
    // Guards the regression this replaced: `publicTools` was a hardcoded
    // allow-list of 19 names, leaving 37 shipped routes indexed in the sitemap
    // but unreachable from the catalog, the homepage, and tool history.
    expect(publicTools).toHaveLength(liveTools.length);
    expect(new Set(publicTools.map((tool) => tool.path))).toEqual(
      new Set(liveTools.map((tool) => tool.path))
    );
  });

  it('groups live tools into product workflow pillars', () => {
    const pillarNames = toolPillars.map((pillar) => pillar.name);

    expect(pillarNames).toEqual([
      'Logs & Errors',
      'API / Network',
      'Auth / Security',
      'Mobile Debugging',
      'DevOps / Observability',
      'Performance',
      'Dev Utilities',
    ]);
    expect(liveTools.every((tool) => pillarNames.includes(tool.pillar))).toBe(true);
  });

  it('keeps proposed backlog modules separate from live tools', () => {
    const liveNames = new Set(liveTools.map((tool) => tool.name));

    expect(proposedTools.length).toBeGreaterThan(0);
    expect(proposedTools.some((tool) => liveNames.has(tool.name))).toBe(false);
  });

  it('keeps live tool routes unique', () => {
    const paths = liveTools.map((tool) => tool.path);

    expect(new Set(paths).size).toBe(paths.length);
  });
});
