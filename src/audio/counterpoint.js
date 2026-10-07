import * as Tone from "tone";


/* COUNTERPOINT */

export function createCounterpoint() {
  const synth =
    new Tone.PolySynth(
      Tone.Synth,
      {
        oscillator: {
          type: "triangle",
        },

        envelope: {
          attack: 0.05,
          decay: 0.5,
          sustain: 0.55,
          release: 1.7,
        },
      }
    );

  const gain =
    new Tone.Gain(0);

  const filter =
    new Tone.Filter({
      frequency: 3400,
      type: "lowpass",
      Q: 0.7,
    });

  const distortion =
    new Tone.Distortion({
      distortion: 0.06,
      wet: 0,
    });

  const chorus =
    new Tone.Chorus({
      frequency: 1.3,
      delayTime: 3,
      depth: 0.24,
      wet: 0.12,
    }).start();

  const delay =
    new Tone.PingPongDelay({
      delayTime: "8n.",
      feedback: 0.13,
      wet: 0.06,
    });

  const reverb =
    new Tone.Reverb({
      decay: 3.5,
      preDelay: 0.02,
      wet: 0.22,
    });

  const channel =
    new Tone.Channel({
      volume: -2,
      pan: 0.18,
    });

  synth.chain(
    gain,
    filter,
    distortion,
    chorus,
    delay,
    reverb,
    channel
  );

  return {
    synth,
    gain,
    filter,
    distortion,
    chorus,
    delay,
    reverb,
    channel,
    selectedEffect:
      "chorus",
  };
}