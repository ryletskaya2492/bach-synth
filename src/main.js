import * as Tone from "tone";

import {
  createCantus,
} from "./audio/cantus.js";

import {
  createCounterpoint,
} from "./audio/counterpoint.js";

import {
  createTransport,
} from "./audio/transport.js";


/* AUDIO */

const cantus =
  createCantus();

const counterpoint =
  createCounterpoint();

const master =
  new Tone.Volume(-5)
    .toDestination();

cantus.channel.connect(master);
counterpoint.channel.connect(master);

let masterMuted = false;
let isPlaying = false;


/* ELEMENTS */

const traceLiveLayer =
  document.querySelector(
    "#traceLiveLayer"
  );

const circleField =
  document.querySelector(
    "#circleField"
  );

const transportButtons =
  document.querySelectorAll(
    ".transport button"
  );

const playButton =
  transportButtons[0];

const stopButton =
  transportButtons[1];

const muteButton =
  transportButtons[2];


/* CENTER VISUAL */

const visualCircles = [];

const circleCount = 12;

let visualPlaying = false;
let visualTempo = 82;


function random(
  min,
  max
) {
  return (
    min +
    Math.random() *
      (max - min)
  );
}


function createCircleField() {
  if (!circleField) {
    return;
  }

  for (
    let i = 0;
    i < circleCount;
    i += 1
  ) {
    const element =
      document.createElement(
        "div"
      );

    element.className =
      "music-circle";

    circleField.appendChild(
      element
    );

    visualCircles.push({
      element,

      x: random(
        50,
        720
      ),

      y: random(
        40,
        540
      ),

      vx: random(
        -0.12,
        0.12
      ),

      vy: random(
        -0.12,
        0.12
      ),

      phase:
        Math.random() *
        Math.PI *
        2,

      wobble:
        random(
          0.004,
          0.012
        ),
    });
  }
}


function durationEnergy(
  duration
) {
  switch (duration) {
    case "16n":
      return 2.6;

    case "8n":
      return 1.8;

    case "8n.":
      return 1.35;

    case "4n":
      return 0.9;

    default:
      return 1;
  }
}


function noteHeight(note) {
  const midi =
    Tone.Frequency(
      note
    ).toMidi();

  const low =
    Tone.Frequency(
      "C2"
    ).toMidi();

  const high =
    Tone.Frequency(
      "A5"
    ).toMidi();

  const value =
    (
      midi -
      low
    ) /
    (
      high -
      low
    );

  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}


function reactToNote({
  voice,
  note,
  duration,
}) {
  const tempoEnergy =
    Math.pow(
      visualTempo / 82,
      1.2
    );

  const energy =
    durationEnergy(
      duration
    ) *
    tempoEnergy;

  const pitch =
    noteHeight(
      note
    );

  const amount =
    voice === "cantus"
      ? 4
      : 3;

  const start =
    Math.floor(
      Math.random() *
      visualCircles.length
    );

  for (
    let i = 0;
    i < amount;
    i += 1
  ) {
    const circle =
      visualCircles[
        (
          start + i
        ) %
        visualCircles.length
      ];

    const horizontal =
      random(
        0.4,
        1
      ) *
      energy;

    const vertical =
      (
        0.5 -
        pitch
      ) *
      2.2 *
      energy;

    if (
      voice ===
      "cantus"
    ) {
      circle.vx +=
        horizontal;

      circle.vy +=
        vertical -
        0.3 *
        energy;
    } else {
      circle.vx -=
        horizontal *
        0.75;

      circle.vy +=
        vertical +
        0.3 *
        energy;
    }
  }
}


function animateCircles() {
  if (!circleField) {
    return;
  }

  const width =
    circleField.clientWidth;

  const height =
    circleField.clientHeight;

  const tempoFactor =
    Math.pow(
      visualTempo / 82,
      1.7
    );

  visualCircles.forEach(
    (
      circle,
      index
    ) => {
      circle.phase +=
        circle.wobble *
        tempoFactor;

      const driftX =
        Math.sin(
          circle.phase +
          index
        ) *
        0.045;

      const driftY =
        Math.cos(
          circle.phase *
            0.8 +
          index
        ) *
        0.045;

      if (
        visualPlaying
      ) {
        circle.vx +=
          driftX *
          tempoFactor;

        circle.vy +=
          driftY *
          tempoFactor;
      }

      circle.vx *=
        visualPlaying
          ? 0.972
          : 0.93;

      circle.vy *=
        visualPlaying
          ? 0.972
          : 0.93;

      circle.x +=
        circle.vx *
        tempoFactor;

      circle.y +=
        circle.vy *
        tempoFactor;

      const margin =
        35;

      if (
        circle.x <
        -margin
      ) {
        circle.x =
          width +
          margin;
      }

      if (
        circle.x >
        width +
          margin
      ) {
        circle.x =
          -margin;
      }

      if (
        circle.y <
        -margin
      ) {
        circle.y =
          height +
          margin;
      }

      if (
        circle.y >
        height +
          margin
      ) {
        circle.y =
          -margin;
      }

      circle.element
        .style
        .transform =
        `translate3d(${circle.x}px, ${circle.y}px, 0)`;
    }
  );

  requestAnimationFrame(
    animateCircles
  );
}


createCircleField();

requestAnimationFrame(
  animateCircles
);


/* TRACE */

const asset =
  (path) =>
    `${import.meta.env.BASE_URL}${path}`;

const upGlyphs = [
  asset("icons/n_1.svg"),
  asset("icons/n_2.svg"),
  asset("icons/n_7.svg"),
];

const downGlyphs = [
  asset("icons/n_3.svg"),
  asset("icons/n_6.svg"),
  asset("icons/n_8.svg"),
];

const traceNotes = [];

const maxTraceNotes = 7;

let traceIndex = 0;
let traceResetting = false;
let upIndex = 0;
let downIndex = 0;


function getTraceY(
  noteName
) {
  const midi =
    Tone.Frequency(
      noteName
    ).toMidi();

  const low =
    Tone.Frequency(
      "C4"
    ).toMidi();

  const high =
    Tone.Frequency(
      "A5"
    ).toMidi();

  const clamped =
    Math.max(
      low,
      Math.min(
        high,
        midi
      )
    );

  const ratio =
    (
      clamped -
      low
    ) /
    (
      high -
      low
    );

  return (
    66 -
    ratio * 62
  );
}


function getTraceGlyph(y) {
  if (y >= 36) {
    const glyph =
      upGlyphs[
        upIndex %
        upGlyphs.length
      ];

    upIndex += 1;

    return glyph;
  }

  const glyph =
    downGlyphs[
      downIndex %
      downGlyphs.length
    ];

  downIndex += 1;

  return glyph;
}


function clearTrace(
  immediate = false
) {
  const oldNotes =
    [...traceNotes];

  traceNotes.length = 0;
  traceIndex = 0;

  oldNotes.forEach(
    (note) => {
      if (immediate) {
        note.remove();
        return;
      }

      note.classList.remove(
        "is-visible"
      );

      note.classList.add(
        "is-fading"
      );

      setTimeout(
        () => {
          note.remove();
        },
        400
      );
    }
  );
}


function addTraceNote(
  noteName
) {
  if (
    !traceLiveLayer ||
    !isPlaying ||
    traceResetting
  ) {
    return;
  }

  if (
    traceIndex >=
    maxTraceNotes
  ) {
    traceResetting = true;

    clearTrace(false);

    setTimeout(
      () => {
        traceResetting =
          false;

        addTraceNote(
          noteName
        );
      },
      480
    );

    return;
  }

  const y =
    getTraceY(
      noteName
    );

  const glyph =
    getTraceGlyph(y);

  const width =
    traceLiveLayer
      .clientWidth;

  const startX =
    34;

  const endX =
    Math.max(
      60,
      width - 30
    );

  const step =
    (
      endX -
      startX
    ) /
    (
      maxTraceNotes - 1
    );

  const x =
    startX +
    traceIndex *
    step;

  const element =
    document.createElement(
      "img"
    );

  element.className =
    "trace-live-note";

  element.src =
    glyph;

  element.alt =
    "";

  element.style.left =
    `${x}px`;

  element.style.top =
    `${y}px`;

  traceLiveLayer.appendChild(
    element
  );

  traceNotes.push(
    element
  );

  requestAnimationFrame(
    () => {
      element.classList.add(
        "is-visible"
      );
    }
  );

  traceIndex += 1;
}


/* TRANSPORT */

const transport =
  createTransport(
    cantus,
    counterpoint,

    ({
      voice,
      note,
      duration,
    }) => {
      reactToNote({
        voice,
        note,
        duration,
      });
    },

    ({
      voice,
      note,
    }) => {
      if (
        voice !==
        "cantus"
      ) {
        return;
      }

      addTraceNote(
        note
      );
    }
  );


/* CONDUCTOR */

playButton?.addEventListener(
  "click",
  async () => {
    await Tone.start();

    if (isPlaying) {
      return;
    }

    isPlaying = true;
    visualPlaying = true;

    transport.start();

    clearTrace(true);

    playButton.classList.add(
      "active"
    );

    stopButton?.classList.remove(
      "active"
    );
  }
);


stopButton?.addEventListener(
  "click",
  () => {
    if (!isPlaying) {
      return;
    }

    isPlaying = false;
    visualPlaying = false;

    transport.stop();

    clearTrace(true);

    playButton?.classList.remove(
      "active"
    );

    stopButton.classList.add(
      "active"
    );
  }
);


muteButton?.addEventListener(
  "click",
  () => {
    masterMuted =
      !masterMuted;

    master.mute =
      masterMuted;

    muteButton.classList.toggle(
      "active",
      masterMuted
    );

    muteButton.textContent =
      masterMuted
        ? "UNMUTE"
        : "MUTE";
  }
);


/* VOICES */

const panels =
  document.querySelectorAll(
    ".voice-panel"
  );


function setupVoicePanel(
  panel,
  voice
) {
  const waveButtons =
    panel.querySelectorAll(
      ".wave-buttons button"
    );

  waveButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const type =
            button.textContent
              .trim()
              .toLowerCase();

          voice.synth.set({
            oscillator: {
              type,
            },
          });

          waveButtons.forEach(
            (item) => {
              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );
        }
      );
    }
  );


  panel
    .querySelectorAll(
      ".control-row"
    )
    .forEach(
      (row) => {
        const label =
          row.querySelector(
            "span"
          );

        const slider =
          row.querySelector(
            "input"
          );

        if (
          !label ||
          !slider
        ) {
          return;
        }

        const name =
          label.textContent
            .trim()
            .toLowerCase();

        slider.addEventListener(
          "input",
          () => {
            updateParameter(
              name,
              Number(
                slider.value
              ) /
                100,
              voice
            );
          }
        );
      }
    );


  const effectButtons =
    panel.querySelectorAll(
      ".effects-grid button"
    );

  effectButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          voice.selectedEffect =
            button.textContent
              .trim()
              .toLowerCase();

          effectButtons.forEach(
            (item) => {
              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );
        }
      );
    }
  );
}


if (panels[0]) {
  setupVoicePanel(
    panels[0],
    cantus
  );
}

if (panels[1]) {
  setupVoicePanel(
    panels[1],
    counterpoint
  );
}


/* PARAMETERS */

function updateParameter(
  name,
  value,
  voice
) {
  switch (name) {
    case "attack":
      voice.gain.gain.rampTo(
        value,
        0.08
      );
      break;


    case "decay":
      voice.synth.set({
        envelope: {
          decay:
            0.05 +
            value * 2,
        },
      });
      break;


    case "sustain":
      voice.synth.set({
        envelope: {
          sustain:
            value,
        },
      });
      break;


    case "release":
      voice.synth.set({
        envelope: {
          release:
            0.1 +
            value * 5,
        },
      });
      break;


    case "frequency":
      voice.filter.frequency
        .rampTo(
          180 *
            Math.pow(
              45,
              value
            ),
          0.1
        );
      break;


    case "resonance":
      voice.filter.Q.rampTo(
        0.5 +
          value * 14,
        0.1
      );
      break;


    case "amount":
      updateEffectAmount(
        voice,
        value
      );
      break;


    case "volume":
      voice.channel.volume
        .rampTo(
          -30 +
            value * 30,
          0.1
        );
      break;


    case "pan":
      voice.channel.pan
        .rampTo(
          value * 2 - 1,
          0.1
        );
      break;
  }
}


function updateEffectAmount(
  voice,
  amount
) {
  voice.distortion.wet.rampTo(
    voice.selectedEffect ===
      "distortion"
      ? amount * 0.45
      : 0,
    0.1
  );

  voice.reverb.wet.rampTo(
    voice.selectedEffect ===
      "reverb"
      ? amount * 0.75
      : 0,
    0.1
  );

  voice.chorus.wet.rampTo(
    voice.selectedEffect ===
      "chorus"
      ? amount * 0.65
      : 0,
    0.1
  );

  voice.delay.wet.rampTo(
    voice.selectedEffect ===
      "delay"
      ? amount * 0.55
      : 0,
    0.1
  );
}


/* MASTER */

document
  .querySelectorAll(
    ".master-row"
  )
  .forEach(
    (row) => {
      const label =
        row.querySelector(
          "span"
        );

      const slider =
        row.querySelector(
          "input"
        );

      if (
        !label ||
        !slider
      ) {
        return;
      }

      const name =
        label.textContent
          .trim()
          .toLowerCase();

      slider.addEventListener(
        "input",
        () => {
          const value =
            Number(
              slider.value
            ) /
            100;


          if (
            name ===
            "tempo"
          ) {
            const bpm =
              50 +
              value * 100;

            transport.setTempo(
              bpm
            );

            visualTempo =
              bpm;
          }


          if (
            name ===
            "balance"
          ) {
            const balance =
              value * 2 - 1;

            cantus.channel.volume
              .rampTo(
                -8 -
                  Math.max(
                    0,
                    balance
                  ) *
                    18,
                0.1
              );

            counterpoint.channel.volume
              .rampTo(
                -8 -
                  Math.max(
                    0,
                    -balance
                  ) *
                    18,
                0.1
              );
          }


          if (
            name ===
            "master"
          ) {
            master.volume.rampTo(
              -30 +
                value * 30,
              0.1
            );
          }
        }
      );
    }
  );