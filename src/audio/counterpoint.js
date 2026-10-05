import * as Tone from "tone";

export function createCounterpoint() {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },

    envelope: {
      attack: 0.35,
      decay: 0.4,
      sustain: 0.45,
      release: 1.8,
    },
  });

  const filter = new Tone.Filter({
    frequency: 1900,
    type: "lowpass",
    Q: 1,
  });

  const distortion = new Tone.Distortion({
    distortion: 0.1,
    wet: 0,
  });

  const chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3,
    depth: 0.3,
    wet: 0.12,
  }).start();

  const delay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.18,
    wet: 0,
  });

  const reverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.025,
    wet: 0.18,
  });

  const channel = new Tone.Channel({
    volume: -10,
    pan: 0.22,
  });

  synth.chain(
    filter,
    distortion,
    chorus,
    delay,
    reverb,
    channel
  );

  return {
    synth,
    filter,
    distortion,
    chorus,
    delay,
    reverb,
    channel,

    selectedEffect: "chorus",
  };
}