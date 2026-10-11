export const equalizerBands = [60, 230, 910, 3600, 14000] as const;
export const equalizerPresets: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0], Bass: [6, 4, 0, -1, 0],
  Vocal: [-2, 0, 4, 3, -1], Bright: [-1, 0, 1, 3, 5],
};
export function createEqualizer(audio: HTMLAudioElement) {
  const context = new AudioContext();
  const source = context.createMediaElementSource(audio);
  const filters = equalizerBands.map((frequency, index) => {
    const filter = context.createBiquadFilter();
    filter.type = index === 0 ? 'lowshelf' : index === equalizerBands.length - 1 ? 'highshelf' : 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    return filter;
  });
  const headroom = context.createGain();
  let previous: AudioNode = source;
  for (const filter of filters) { previous.connect(filter); previous = filter; }
  previous.connect(headroom); headroom.connect(context.destination);
  return { context, update(gains: number[], enabled: boolean) {
    filters.forEach((filter, index) => filter.gain.setTargetAtTime(enabled ? (gains[index] ?? 0) : 0, context.currentTime, 0.02));
    headroom.gain.setTargetAtTime(enabled ? 10 ** (-Math.max(0, ...gains) / 20) : 1, context.currentTime, 0.02);
  } };
}