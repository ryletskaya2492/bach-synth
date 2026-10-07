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
          attack: 0.18,
          decay: 0.6,
          sustain: 0.55,
          release: 2.5,
        },
      }
    );

  const gain =
    new Tone.Gain(0);

  const filter =
    new Tone.Filter({
      frequency: 2400,
      type: "lowpass",
      Q: 1.2,
    });

  const distortion =
    new Tone.Distortion({
      distortion: 0.15,
      wet: 0,
    });

  const chorus =
    new Tone.Chorus({
      frequency: 1.2,
      delayTime: 3.5,
      depth: 0.25,
      wet: 0,
    }).start();

  const delay =
    new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.2,
      wet: 0,
    });

  const reverb =
    new Tone.Reverb({
      decay: 5,
      preDelay: 0.03,
      wet: 0.22,
    });

  const channel =
    new Tone.Channel({
      volume: -8,
      pan: -0.22,
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