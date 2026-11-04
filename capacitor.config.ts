import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.melo.player',
  appName: 'NocTune',
  webDir: 'dist/client',
  android: { backgroundColor: '#141519' },
  plugins: {
    SystemBars: {
      // The app is full-bleed and handles safe areas with CSS env() values.
      initialViewportFitValueHint: 'cover',
    },
  },
};
export default config;
