import * as Tone from "tone";


/* MUSIC */

const harmonies = [
  ["C", "E", "G"],
  ["A", "C", "E"],
  ["F", "A", "C"],
  ["G", "B", "D"],
];

const cantusRange = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
];

const counterRange = [
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
];

const durations = [
  {
    tone: "16n",
    ticks: 1,
    weight: 3,
  },
  {
    tone: "8n",
    ticks: 2,
    weight: 7,
  },
  {
    tone: "8n.",
    ticks: 3,
    weight: 3,
  },
  {
    tone: "4n",
    ticks: 4,
    weight: 6,
  },
];


/* HELPERS */

function noteLetter(note) {
  return note.replace(
    /[#b]?\d+/,
    ""
  );
}


function weightedChoice(items) {
  const total =
    items.reduce(
      (sum, item) =>
        sum + item.weight,
      0
    );

  let random =
    Math.random() * total;

  for (const item of items) {
    random -= item.weight;

    if (random <= 0) {
      return item;
    }
  }

  return items[
    items.length - 1
  ];
}


function distance(
  range,
  a,
  b
) {
  return Math.abs(
    range.indexOf(a) -
      range.indexOf(b)
  );
}


function midi(note) {
  return Tone.Frequency(
    note
  ).toMidi();
}


function isConsonant(
  noteA,
  noteB
) {
  if (!noteA || !noteB) {
    return true;
  }

  const interval =
    Math.abs(
      midi(noteA) -
        midi(noteB)
    ) % 12;

  return [
    0,
    3,
    4,
    7,
    8,
    9,
  ].includes(interval);
}


function chooseDuration() {
  return weightedChoice(
    durations
  );
}


function buildCandidates(
  range,
  harmony,
  previousNote
) {
  const candidates =
    range
      .filter(
        (note) =>
          distance(
            range,
            previousNote,
            note
          ) <= 3
      )
      .map(
        (note) => {
          const movement =
            distance(
              range,
              previousNote,
              note
            );

          let weight = 1;

          if (
            harmony.includes(
              noteLetter(note)
            )
          ) {
            weight += 5;
          }

          if (movement === 1) {
            weight += 5;
          }

          if (movement === 2) {
            weight += 2;
          }

          if (
            note ===
            previousNote
          ) {
            weight *= 0.25;
          }

          return {
            note,
            weight,
          };
        }
      );

  return candidates;
}


function chooseMelodicNote(
  range,
  harmony,
  previousNote
) {
  return weightedChoice(
    buildCandidates(
      range,
      harmony,
      previousNote
    )
  ).note;
}


function chooseCounterNote(
  range,
  harmony,
  previousNote,
  cantusNote
) {
  const base =
    buildCandidates(
      range,
      harmony,
      previousNote
    );

  const consonant =
    base.filter(
      (item) =>
        isConsonant(
          item.note,
          cantusNote
        )
    );

  const pool =
    consonant.length
      ? consonant
      : base;

  return weightedChoice(
    pool
  ).note;
}


/* TRANSPORT */

export function createTransport(
  cantus,
  counterpoint,
  onNote,
  onTraceNote
) {
  const transport =
    Tone.getTransport();

  transport.bpm.value = 76;

  const voices = {
    cantus: {
      synth: cantus.synth,
      range: cantusRange,
      playing: false,
      muted: false,
      previousNote: "E4",
      currentNote: null,
      remaining: 0,
      velocity: 0.52,
    },

    counterpoint: {
      synth: counterpoint.synth,
      range: counterRange,
      playing: false,
      muted: false,
      previousNote: "C3",
      currentNote: null,
      remaining: 0,
      velocity: 0.42,
    },
  };

  let running = false;
  let tick = 0;
  let harmonyIndex = 0;


  function currentHarmony() {
    return harmonies[
      harmonyIndex %
        harmonies.length
    ];
  }


  function anyPlaying() {
    return (
      voices.cantus.playing ||
      voices.counterpoint.playing
    );
  }


  function playVoice(
    name,
    time
  ) {
    const voice =
      voices[name];

    if (!voice.playing) {
      voice.currentNote = null;
      return;
    }

    if (
      voice.remaining > 0
    ) {
      voice.remaining -= 1;
      return;
    }

    const harmony =
      currentHarmony();

    const duration =
      chooseDuration();

    let note;

    if (
      name ===
      "cantus"
    ) {
      note =
        chooseMelodicNote(
          voice.range,
          harmony,
          voice.previousNote
        );
    } else {
      note =
        chooseCounterNote(
          voice.range,
          harmony,
          voice.previousNote,
          voices.cantus.currentNote
        );
    }

    voice.previousNote =
      note;

    voice.currentNote =
      note;

    voice.remaining =
      duration.ticks - 1;

    if (voice.muted) {
      return;
    }

    const velocity =
      voice.velocity +
      Math.random() * 0.06;

    voice.synth
      .triggerAttackRelease(
        note,
        duration.tone,
        time,
        velocity
      );

    Tone.getDraw().schedule(
      () => {
        onNote?.({
          voice: name,
          note,
          duration:
            duration.tone,
        });

        onTraceNote?.({
          voice: name,
          note,
          duration:
            duration.tone,
        });
      },
      time
    );
  }


  const loop =
    new Tone.Loop(
      (time) => {
        if (
          tick > 0 &&
          tick % 16 === 0
        ) {
          harmonyIndex =
            (
              harmonyIndex + 1
            ) %
            harmonies.length;
        }

        playVoice(
          "cantus",
          time
        );

        playVoice(
          "counterpoint",
          time
        );

        tick += 1;
      },
      "16n"
    );


  function startClock() {
    if (!running) {
      loop.start(0);
      running = true;
    }

    if (
      transport.state !==
      "started"
    ) {
      transport.start();
    }
  }


  function stopClockIfNeeded() {
    if (anyPlaying()) {
      return;
    }

    transport.stop();
    loop.stop();

    running = false;
    tick = 0;
    harmonyIndex = 0;

    voices.cantus.remaining = 0;
    voices.counterpoint.remaining = 0;

    voices.cantus.currentNote = null;
    voices.counterpoint.currentNote = null;

    voices.cantus.previousNote = "E4";
    voices.counterpoint.previousNote = "C3";

    transport.position = 0;
  }


  return {
    playVoice(name) {
      const voice =
        voices[name];

      if (!voice) {
        return;
      }

      voice.playing = true;
      voice.muted = false;

      startClock();
    },


    stopVoice(name) {
      const voice =
        voices[name];

      if (!voice) {
        return;
      }

      voice.playing = false;
      voice.muted = false;
      voice.remaining = 0;
      voice.currentNote = null;

      voice.synth.releaseAll();

      stopClockIfNeeded();
    },


    muteVoice(
      name,
      muted
    ) {
      const voice =
        voices[name];

      if (!voice) {
        return;
      }

      voice.muted =
        muted;

      if (muted) {
        voice.synth.releaseAll();
      }
    },


    playAll() {
      voices.cantus.playing =
        true;

      voices.counterpoint.playing =
        true;

      voices.cantus.muted =
        false;

      voices.counterpoint.muted =
        false;

      startClock();
    },


    stopAll() {
      voices.cantus.playing =
        false;

      voices.counterpoint.playing =
        false;

      voices.cantus.muted =
        false;

      voices.counterpoint.muted =
        false;

      cantus.synth.releaseAll();
      counterpoint.synth.releaseAll();

      stopClockIfNeeded();
    },


    isVoicePlaying(name) {
      return (
        voices[name]?.playing ??
        false
      );
    },


    isVoiceMuted(name) {
      return (
        voices[name]?.muted ??
        false
      );
    },


    anyPlaying() {
      return anyPlaying();
    },


    setTempo(bpm) {
      transport.bpm.rampTo(
        bpm,
        0.2
      );
    },
  };
}