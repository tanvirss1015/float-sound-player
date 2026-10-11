import { describe, expect, it, vi } from 'vitest';
import { createEqualizer, equalizerBands } from '@/lib/equalizer';

describe('Audio equalizer', () => {
  it('connects all five bands, applies gains and bypasses cleanly', () => {
    const filters: Array<{ gain: { setTargetAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; frequency: { value: number }; Q: { value: number }; type: string }> = [];
    const source = { connect: vi.fn() };
    const headroom = { gain: { setTargetAtTime: vi.fn() }, connect: vi.fn() };
    class FakeContext {
      currentTime = 0;
      destination = {};
      createMediaElementSource = vi.fn(() => source);
      createGain = vi.fn(() => headroom);
      createBiquadFilter() {
        const filter = { gain: { setTargetAtTime: vi.fn() }, connect: vi.fn(), frequency: { value: 0 }, Q: { value: 0 }, type: '' };
        filters.push(filter); return filter;
      }
    }
    vi.stubGlobal('AudioContext', FakeContext);
    try {
      const eq = createEqualizer(document.createElement('audio'));
      expect(filters.map(f => f.frequency.value)).toEqual([...equalizerBands]);
      expect(source.connect).toHaveBeenCalledWith(filters[0]);
      eq.update([6, 4, 0, -1, 0], true);
      expect(filters[0]?.gain.setTargetAtTime).toHaveBeenLastCalledWith(6, 0, 0.02);
      expect(headroom.gain.setTargetAtTime).toHaveBeenLastCalledWith(10 ** (-6 / 20), 0, 0.02);
      eq.update([6, 4, 0, -1, 0], false);
      for (const filter of filters) expect(filter.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.02);
      expect(headroom.gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, 0.02);
    } finally { vi.unstubAllGlobals(); }
  });
});