export const equalizerBands = [60, 230, 910, 3600, 14000];
export const equalizerPresets: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  'Bass boost': [6, 4, 0, -1, 0],
  Vocal: [-2, 0, 4, 3, -1],
  Balanced: [3, 1, -1, 1, 3],
};

export function createEqualizer(audio: HTMLAudioElement) {
  const context = new AudioContext();
  const source = context.createMediaElementSource(audio);
  const headroom = context.createGain();
  const filters = equalizerBands.map(frequency => {
    const filter = context.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    return filter;
  });
  let output: AudioNode = source;
  for (const filter of filters) { output.connect(filter); output = filter; }
  output.connect(headroom);
  headroom.connect(context.destination);
  return {
    context,
    update(enabled: boolean, gains: number[]) {
      filters.forEach((filter, index) => filter.gain.setTargetAtTime(enabled ? (gains[index] ?? 0) : 0, context.currentTime, 0.03));
      const boost = enabled ? Math.max(0, ...gains) : 0;
      headroom.gain.setTargetAtTime(Math.pow(10, -boost / 20), context.currentTime, 0.03);
    },
    resume: () => context.resume(),
  };
}