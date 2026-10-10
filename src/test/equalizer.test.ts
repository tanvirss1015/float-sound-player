import { describe, expect, it, vi } from 'vitest';
import { createEqualizer, equalizerBands } from '@/lib/equalizer';

describe('Audio equalizer', () => {
  it('connects five frequency filters and applies or bypasses their gains', () => {
    const filters: { gain: { setTargetAtTime: ReturnType<typeof vi.fn> }; frequency: { value: number }; Q: { value: number }; connect: ReturnType<typeof vi.fn> }[] = [];
    const gain = { gain: { setTargetAtTime: vi.fn() }, connect: vi.fn() };
    const source = { connect: vi.fn() };
    class MockAudioContext {
      currentTime = 0;
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      createMediaElementSource = vi.fn(() => source);
      createGain = vi.fn(() => gain);
      createBiquadFilter() {
        const filter = { type: '', gain: { setTargetAtTime: vi.fn() }, frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() };
        filters.push(filter);
        return filter;
      }
    }
    vi.stubGlobal('AudioContext', MockAudioContext);
    try {
      const eq = createEqualizer(document.createElement('audio'));
      expect(filters.map(f => f.frequency.value)).toEqual(equalizerBands);
      expect(source.connect).toHaveBeenCalledWith(filters[0]);
      eq.update(true, [6, 4, 0, -1, 0]);
      expect(filters[0]?.gain.setTargetAtTime).toHaveBeenLastCalledWith(6, 0, 0.03);
      expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(Math.pow(10, -6 / 20), 0, 0.03);
      eq.update(false, [6, 4, 0, -1, 0]);
      filters.forEach(filter => expect(filter.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.03));
    } finally { vi.unstubAllGlobals(); }
  });
});