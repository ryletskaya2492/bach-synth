import * as Tone from "tone";

export function createTransport(cantus, counterpoint, onNote, onTraceNote) {
  const transport = Tone.getTransport();
  transport.bpm.value = 80;

  // =========================================================
  // BWV 772 — J. S. Bach
  // верхний голос (первые такты)
  // =========================================================
  const cantusSequence = [
    { note: null, duration: "16n" },

    { note: "C4", duration: "16n" },
    { note: "D4", duration: "16n" },
    { note: "E4", duration: "16n" },
    { note: "F4", duration: "16n" },
    { note: "D4", duration: "16n" },
    { note: "E4", duration: "16n" },
    { note: "C4", duration: "16n" },
    { note: "G4", duration: "8n" },
    { note: "C5", duration: "8n" },
    { note: "B4", duration: "8n" },
    { note: "C5", duration: "8n" },

    { note: "D5", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "D5", duration: "8n" },
    { note: "G5", duration: "8n" },
    { note: "F5", duration: "8n" },
    { note: "G5", duration: "8n" },

    { note: "E5", duration: "16n" },
    { note: "A5", duration: "16n" },
    { note: "G5", duration: "16n" },
    { note: "F5", duration: "16n" },
    { note: "E5", duration: "16n" },
    { note: "G5", duration: "16n" },
    { note: "F5", duration: "16n" },
    { note: "A5", duration: "16n" },
    { note: "G5", duration: "16n" },
    { note: "F5", duration: "16n" },
    { note: "E5", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "E5", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "F5", duration: "16n" },

    { note: "E5", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "F#4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "B4", duration: "16n" },

    { note: "A4", duration: "8n" },
    { note: "D4", duration: "8n" },
    { note: "C5", duration: "8n." },
    { note: "D5", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "F#4", duration: "16n" },
    { note: "E4", duration: "16n" },
    { note: "G4", duration: "16n" },
    { note: "F#4", duration: "16n" },
    { note: "A4", duration: "16n" },

    { note: "G4", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "A4", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "B4", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "C5", duration: "16n" },
    { note: "E5", duration: "16n" },
    { note: "D5", duration: "16n" },
    { note: "B4", duration: "32n" },
    { note: "C5", duration: "32n" },
    { note: "D5", duration: "16n" },
    { note: "G5", duration: "16n" },
    { note: "B4", duration: "8n" },
    { note: "A4", duration: "16n" },
    { note: "G4", duration: "16n" },
  ];

  // =========================================================
  // нижний голос
  // =========================================================
  const counterSequence = [
    { note: null, duration: "2n" },
    { note: null, duration: "16n" },

    { note: "C3", duration: "16n" },
    { note: "D3", duration: "16n" },
    { note: "E3", duration: "16n" },
    { note: "F3", duration: "16n" },
    { note: "D3", duration: "16n" },
    { note: "E3", duration: "16n" },
    { note: "C3", duration: "16n" },

    { note: "G3", duration: "8n" },
    { note: "G2", duration: "8n" },
    { note: null, duration: "4n" },
    { note: null, duration: "16n" },
    { note: "G3", duration: "16n" },
    { note: "A3", duration: "16n" },
    { note: "B3", duration: "16n" },
    { note: "C4", duration: "16n" },
    { note: "A3", duration: "16n" },
    { note: "B3", duration: "16n" },
    { note: "G3", duration: "16n" },

    { note: "C4", duration: "8n" },
    { note: "B3", duration: "8n" },
    { note: "C4", duration: "8n" },
    { note: "D4", duration: "8n" },
    { note: "E4", duration: "8n" },
    { note: "G3", duration: "8n" },
    { note: "A3", duration: "8n" },
    { note: "B3", duration: "8n" },

    { note: "C4", duration: "8n" },
    { note: "E3", duration: "8n" },
    { note: "F#3", duration: "8n" },
    { note: "G3", duration: "8n" },
    { note: "A3", duration: "8n" },
    { note: "B3", duration: "8n" },
    { note: "C4", duration: "4n" },

    { note: "C4", duration: "16n" },
    { note: "D3", duration: "16n" },
    { note: "E3", duration: "16n" },
    { note: "F#3", duration: "16n" },
    { note: "G3", duration: "16n" },
    { note: "E3", duration: "16n" },
    { note: "F#3", duration: "16n" },
    { note: "D3", duration: "16n" },
    { note: "G3", duration: "8n" },
    { note: "B2", duration: "8n" },
    { note: "C3", duration: "8n" },
    { note: "D3", duration: "8n" },

    { note: "E3", duration: "8n" },
    { note: "F#3", duration: "8n" },
    { note: "G3", duration: "8n" },
    { note: "E3", duration: "8n" },
    { note: "B2", duration: "8n." },
    { note: "C3", duration: "16n" },
    { note: "D3", duration: "8n" },
    { note: "D2", duration: "8n" },
  ];

  let cantusPart;
  let counterPart;
  let running = false;

  function buildPart(sequence, synthRef, voiceName) {
    let currentTime = 0;
    const events = [];

    sequence.forEach((item) => {
      events.push({
        time: currentTime,
        note: item.note,
        duration: item.duration,
      });

      currentTime += Tone.Time(item.duration).toSeconds();
    });

    const part = new Tone.Part((time, value) => {
      if (value.note) {
        const velocity =
          voiceName === "cantus"
            ? 0.58 + Math.random() * 0.12
            : 0.46 + Math.random() * 0.12;

        synthRef.synth.triggerAttackRelease(
          value.note,
          value.duration,
          time,
          velocity
        );

        Tone.getDraw().schedule(() => {
          onNote?.({
            voice: voiceName,
            note: value.note,
            velocity,
          });

          onTraceNote?.({
            voice: voiceName,
            note: value.note,
          });
        }, time);
      }
    }, events);

    part.loop = true;
    part.loopEnd = currentTime;

    return part;
  }

  cantusPart = buildPart(cantusSequence, cantus, "cantus");
  counterPart = buildPart(counterSequence, counterpoint, "counterpoint");

  return {
    start() {
      if (running) return;

      running = true;

      cantusPart.start(0);
      counterPart.start(0);
      transport.start();
    },

    stop() {
      if (!running) return;

      running = false;

      transport.stop();
      cantusPart.stop();
      counterPart.stop();

      cantus.synth.releaseAll();
      counterpoint.synth.releaseAll();

      transport.position = 0;
    },

    setTempo(bpm) {
      transport.bpm.rampTo(bpm, 0.2);
    },
  };
}