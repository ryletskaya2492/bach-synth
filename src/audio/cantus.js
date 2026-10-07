import * as Tone from "tone";


/* CANTUS */

export function createCantus() {
  const synth =
    new Tone.PolySynth(
      Tone.Synth,
      {
        oscillator: {
          type: "sine",
        },

        envelope: {
          attack: 0.04,
          decay: 0.45,
          sustain: 0.62,
          release: 1.8,
        },
      }
    );

  const gain =
    new Tone.Gain(0);

  const filter =
    new Tone.Filter({
      frequency: 4200,
      type: "lowpass",
      Q: 0.8,
    });

  const distortion =
    new Tone.Distortion({
      distortion: 0.08,
      wet: 0,
    });

  const chorus =
    new Tone.Chorus({
      frequency: 1.15,
      delayTime: 3,
      depth: 0.2,
      wet: 0.05,
    }).start();

  const delay =
    new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.16,
      wet: 0.08,
    });

  const reverb =
    new Tone.Reverb({
      decay: 3.8,
      preDelay: 0.02,
      wet: 0.28,
    });

  const channel =
    new Tone.Channel({
      volume: -1,
      pan: -0.18,
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
      "reverb",
  };
}