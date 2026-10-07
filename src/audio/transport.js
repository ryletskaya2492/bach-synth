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

function consonant(
  noteA,
  noteB
) {
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

function buildCandidates(
  range,
  harmony,
  previousNote
) {
  return range
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
          note === previousNote
        ) {
          weight *= 0.25;
        }

        return {
          note,
          weight,
        };
      }
    );
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

  transport.bpm.value = 82;

  let running = false;
  let tick = 0;
  let harmonyIndex = 0;

  const voices = {
    cantus: {
      synth: cantus.synth,
      range: cantusRange,
      previousNote: "E4",
      currentNote: "E4",
      remaining: 0,
      velocity: 0.54,
    },

    counterpoint: {
      synth: counterpoint.synth,
      range: counterRange,
      previousNote: "C3",
      currentNote: "C3",
      remaining: 0,
      velocity: 0.44,
    },
  };


  function chooseNote(
    name,
    harmony
  ) {
    const voice =
      voices[name];

    let candidates =
      buildCandidates(
        voice.range,
        harmony,
        voice.previousNote
      );

    if (
      name ===
      "counterpoint"
    ) {
      const compatible =
        candidates.filter(
          (item) =>
            consonant(
              item.note,
              voices.cantus.currentNote
            )
        );

      if (compatible.length) {
        candidates =
          compatible;
      }
    }

    return weightedChoice(
      candidates
    ).note;
  }


  function playVoice(
    name,
    time
  ) {
    const voice =
      voices[name];

    if (
      voice.remaining > 0
    ) {
      voice.remaining -= 1;
      return;
    }

    const harmony =
      harmonies[
        harmonyIndex
      ];

    const duration =
      weightedChoice(
        durations
      );

    const note =
      chooseNote(
        name,
        harmony
      );

    voice.previousNote =
      note;

    voice.currentNote =
      note;

    voice.remaining =
      duration.ticks - 1;

    voice.synth
      .triggerAttackRelease(
        note,
        duration.tone,
        time,
        voice.velocity +
          Math.random() *
            0.06
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


  return {
    start() {
      if (running) {
        return;
      }

      running = true;

      loop.start(0);
      transport.start();
    },

    stop() {
      if (!running) {
        return;
      }

      running = false;

      transport.stop();
      loop.stop();

      cantus.synth.releaseAll();
      counterpoint.synth.releaseAll();

      tick = 0;
      harmonyIndex = 0;

      voices.cantus.remaining = 0;
      voices.counterpoint.remaining = 0;

      voices.cantus.previousNote =
        "E4";

      voices.counterpoint.previousNote =
        "C3";

      voices.cantus.currentNote =
        "E4";

      voices.counterpoint.currentNote =
        "C3";

      transport.position = 0;
    },

    setTempo(bpm) {
      transport.bpm.rampTo(
        bpm,
        0.2
      );
    },
  };
}