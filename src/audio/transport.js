import * as Tone from "tone";


/* MUSIC */

const cantusSequence = [
  ["8n", "E5"],
  ["8n", "G5"],
  ["4n", "A5"],
  ["8n", "G5"],
  ["8n", "E5"],
  ["4n", "D5"],

  ["8n", "C5"],
  ["8n", "E5"],
  ["4n", "G5"],
  ["8n", "A5"],
  ["8n", "G5"],
  ["4n", "E5"],

  ["8n", "F5"],
  ["8n", "A5"],
  ["4n", "C6"],
  ["8n", "A5"],
  ["8n", "G5"],
  ["4n", "F5"],

  ["8n", "D5"],
  ["8n", "G5"],
  ["4n", "B5"],
  ["8n", "A5"],
  ["8n", "G5"],
  ["4n", "D5"],

  ["8n", "E5"],
  ["8n", "G5"],
  ["8n", "C6"],
  ["8n", "B5"],
  ["4n", "A5"],
  ["4n", "G5"],

  ["8n", "E5"],
  ["8n", "D5"],
  ["8n", "C5"],
  ["8n", "E5"],
  ["4n", "G5"],
  ["4n", "C6"],
];

const counterSequence = [
  ["4n", "C3"],
  ["8n", "G3"],
  ["8n", "E3"],
  ["4n", "C4"],

  ["4n", "A2"],
  ["8n", "E3"],
  ["8n", "C3"],
  ["4n", "A3"],

  ["4n", "F3"],
  ["8n", "C4"],
  ["8n", "A3"],
  ["4n", "F3"],

  ["4n", "G3"],
  ["8n", "D4"],
  ["8n", "B3"],
  ["4n", "G3"],

  ["8n", "C3"],
  ["8n", "G3"],
  ["8n", "E3"],
  ["8n", "G3"],
  ["4n", "C4"],
  ["4n", "E4"],

  ["8n", "F3"],
  ["8n", "C4"],
  ["8n", "G3"],
  ["8n", "B3"],
  ["4n", "C4"],
  ["4n", "C3"],
];


/* HELPERS */

function durationToTicks(
  duration
) {
  switch (duration) {
    case "16n":
      return 48;

    case "8n":
      return 96;

    case "8n.":
      return 144;

    case "4n":
      return 192;

    case "4n.":
      return 288;

    case "2n":
      return 384;

    default:
      return 96;
  }
}


function buildEvents(
  sequence,
  voice
) {
  let position = 0;

  const events = [];

  sequence.forEach(
    ([
      duration,
      note,
    ]) => {
      events.push({
        time:
          `${position}i`,
        duration,
        note,
        voice,
      });

      position +=
        durationToTicks(
          duration
        );
    }
  );

  return {
    events,
    length:
      `${position}i`,
  };
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

  transport.bpm.value = 84;

  const cantusData =
    buildEvents(
      cantusSequence,
      "cantus"
    );

  const counterData =
    buildEvents(
      counterSequence,
      "counterpoint"
    );

  let running = false;


  const cantusPart =
    new Tone.Part(
      (
        time,
        event
      ) => {
        cantus.synth
          .triggerAttackRelease(
            event.note,
            event.duration,
            time,
            0.78
          );

        Tone.getDraw().schedule(
          () => {
            onNote?.({
              voice:
                event.voice,
              note:
                event.note,
              duration:
                event.duration,
            });

            onTraceNote?.({
              voice:
                event.voice,
              note:
                event.note,
              duration:
                event.duration,
            });
          },
          time
        );
      },
      cantusData.events
    );


  const counterPart =
    new Tone.Part(
      (
        time,
        event
      ) => {
        counterpoint.synth
          .triggerAttackRelease(
            event.note,
            event.duration,
            time,
            0.68
          );

        Tone.getDraw().schedule(
          () => {
            onNote?.({
              voice:
                event.voice,
              note:
                event.note,
              duration:
                event.duration,
            });

            onTraceNote?.({
              voice:
                event.voice,
              note:
                event.note,
              duration:
                event.duration,
            });
          },
          time
        );
      },
      counterData.events
    );


  cantusPart.loop = true;
  counterPart.loop = true;

  cantusPart.loopEnd =
    cantusData.length;

  counterPart.loopEnd =
    counterData.length;


  return {
    start() {
      if (running) {
        return;
      }

      running = true;

      cantusPart.start(0);
      counterPart.start(0);

      transport.start();
    },


    stop() {
      if (!running) {
        return;
      }

      running = false;

      transport.stop();

      cantusPart.stop();
      counterPart.stop();

      cantus.synth.releaseAll();
      counterpoint.synth.releaseAll();

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