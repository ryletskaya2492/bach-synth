import * as Tone from "tone";

import { createCantus } from "./audio/cantus.js";
import { createCounterpoint } from "./audio/counterpoint.js";
import { createTransport } from "./audio/transport.js";


/* AUDIO */

const cantus = createCantus();
const counterpoint = createCounterpoint();

const master =
  new Tone.Volume(-5)
    .toDestination();

cantus.channel.connect(master);
counterpoint.channel.connect(master);

let muted = false;
let isPlaying = false;


/* ELEMENTS */

const transportButtons =
  document.querySelectorAll(
    ".transport button"
  );

const playButton = transportButtons[0];
const stopButton = transportButtons[1];
const muteButton = transportButtons[2];

const bachCover =
  document.querySelector(
    "#bachCover"
  );

const bachScroll =
  document.querySelector(
    "#bach-scroll"
  );

const factCard =
  document.querySelector(
    "#factCard"
  );

const factIndex =
  document.querySelector(
    "#factIndex"
  );

const factText =
  document.querySelector(
    "#factText"
  );

const traceLiveLayer =
  document.querySelector(
    "#traceLiveLayer"
  );


/* FACTS */

const bachFacts = [
  "В\u00A01717 году Баха посадили под\u00A0арест почти на\u00A0месяц за\u00A0попытку уйти со\u00A0службы без\u00A0разрешения.",

  "В\u00A0молодости Бах отправился пешком в\u00A0Любек, чтобы услышать знаменитого органиста Дитриха Букстехуде.",

  "Бах написал «Кофейную кантату» — произведение, связанное с\u00A0лейпцигской кофейной культурой и\u00A0концертами в\u00A0Café Zimmermann.",

  "За\u00A0первые четыре года работы в\u00A0Лейпциге Бах создал около 150 кантат.",

  "При жизни Бах был особенно знаменит как органист, клавишник и\u00A0импровизатор.",

  "У\u00A0Баха было 20 детей, и\u00A0несколько его сыновей сами стали известными композиторами.",

  "В\u00A01720 году Бах вернулся из\u00A0поездки и\u00A0узнал, что его жена Мария Барбара уже умерла и\u00A0была похоронена.",

  "В\u00A01730 году Бах отправил городскому совету длинную жалобу из-за\u00A0нехватки музыкантов и\u00A0плохих условий для\u00A0исполнения музыки.",

  "Незадолго до\u00A0смерти Бах перенёс операцию на\u00A0глазах, после которой его здоровье резко ухудшилось.",

  "Неизвестные произведения Баха находят даже сегодня: в\u00A02005 году исследователи обнаружили ранее неизвестную арию BWV\u00A01127.",
];

let currentFact = 0;
let factsStarted = false;
let factAnimating = false;

function renderFact(index) {
  if (!factIndex || !factText) {
    return;
  }

  factIndex.textContent =
    `${String(index + 1).padStart(2, "0")} / ${String(
      bachFacts.length
    ).padStart(2, "0")}`;

  factText.textContent =
    bachFacts[index];
}

function startFacts() {
  if (!factCard) {
    return;
  }

  factsStarted = true;
  currentFact = 0;

  renderFact(currentFact);

  requestAnimationFrame(() => {
    factCard.classList.add(
      "is-visible"
    );
  });
}

function stopFacts() {
  factsStarted = false;
  factAnimating = false;

  if (!factCard) {
    return;
  }

  factCard.classList.remove(
    "is-visible",
    "is-exit-up",
    "is-exit-down",
    "from-up",
    "from-down"
  );

  setTimeout(() => {
    if (factsStarted) {
      return;
    }

    factIndex.textContent = "";
    factText.textContent = "";
  }, 500);
}

function changeFact(direction) {
  if (
    !factsStarted ||
    factAnimating ||
    !factCard
  ) {
    return;
  }

  factAnimating = true;

  factCard.classList.remove(
    "is-visible"
  );

  factCard.classList.add(
    direction > 0
      ? "is-exit-up"
      : "is-exit-down"
  );

  currentFact =
    direction > 0
      ? (currentFact + 1) %
        bachFacts.length
      : (
          currentFact -
          1 +
          bachFacts.length
        ) %
        bachFacts.length;

  setTimeout(() => {
    factCard.classList.remove(
      "is-exit-up",
      "is-exit-down"
    );

    renderFact(currentFact);

    factCard.classList.add(
      direction > 0
        ? "from-down"
        : "from-up"
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        factCard.classList.remove(
          "from-down",
          "from-up"
        );

        factCard.classList.add(
          "is-visible"
        );
      });
    });
  }, 320);

  setTimeout(() => {
    factAnimating = false;
  }, 850);
}

bachScroll?.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !factsStarted ||
      factAnimating
    ) {
      return;
    }

    if (
      Math.abs(event.deltaY) <
      12
    ) {
      return;
    }

    changeFact(
      event.deltaY > 0
        ? 1
        : -1
    );
  },
  {
    passive: false,
  }
);


/* TRACE */

const traceNotes = [];

let traceIndex = 0;
let traceResetting = false;

const maxTraceNotes = 7;

const traceYMap = {
  C4: 68,
  D4: 64,
  E4: 59,
  F4: 55,
  "F#4": 55,
  G4: 50,
  A4: 46,
  B4: 41,
  C5: 37,
  D5: 32,
  E5: 28,
  F5: 23,
  "F#5": 23,
  G5: 19,
  A5: 14,
  B5: 10,
  C6: 5,
};

let lastUpGlyph = 0;
let lastDownGlyph = 0;

const asset = (path) =>
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

function getTraceY(noteName) {
  return (
    traceYMap[noteName] ??
    36
  );
}

function getTraceNoteImage(y) {
  if (y >= 54) {
    const image =
      upGlyphs[
        lastUpGlyph %
        upGlyphs.length
      ];

    lastUpGlyph++;

    return image;
  }

  const image =
    downGlyphs[
      lastDownGlyph %
      downGlyphs.length
    ];

  lastDownGlyph++;

  return image;
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

      setTimeout(() => {
        note.remove();
      }, 400);
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

    setTimeout(() => {
      traceResetting = false;

      addTraceNote(
        noteName
      );
    }, 480);

    return;
  }

  const y =
    getTraceY(noteName);

  const image =
    getTraceNoteImage(y);

  const width =
    traceLiveLayer
      .clientWidth;

  const startX = 34;
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
      maxTraceNotes -
      1
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

  element.src = image;
  element.alt = noteName;

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

  requestAnimationFrame(() => {
    element.classList.add(
      "is-visible"
    );
  });

  traceIndex++;
}


/* TRANSPORT */

const transport =
  createTransport(
    cantus,
    counterpoint,
    null,
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

      addTraceNote(note);
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

    clearTrace(true);

    bachCover?.classList.add(
      "is-hidden"
    );

    transport.start();

    playButton.classList.add(
      "active"
    );

    stopButton?.classList.remove(
      "active"
    );

    startFacts();
  }
);

stopButton?.addEventListener(
  "click",
  () => {
    isPlaying = false;

    transport.stop();

    clearTrace(true);

    traceResetting = false;

    stopFacts();

    bachCover?.classList.remove(
      "is-hidden"
    );

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
    muted = !muted;

    master.mute = muted;

    muteButton.classList.toggle(
      "active",
      muted
    );

    muteButton.textContent =
      muted
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
              ) / 100,
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

          const rows =
            panel.querySelectorAll(
              ".control-row"
            );

          for (
            const row of rows
          ) {
            const label =
              row.querySelector(
                "span"
              );

            if (
              label?.textContent
                .trim()
                .toLowerCase() !==
              "amount"
            ) {
              continue;
            }

            const slider =
              row.querySelector(
                "input"
              );

            if (slider) {
              updateEffectAmount(
                voice,
                Number(
                  slider.value
                ) / 100
              );
            }
          }
        }
      );
    }
  );
}

setupVoicePanel(
  panels[0],
  cantus
);

setupVoicePanel(
  panels[1],
  counterpoint
);


/* PARAMETERS */

function updateParameter(
  name,
  value,
  voice
) {
  switch (name) {
    case "attack":
      voice.synth.set({
        envelope: {
          attack:
            0.01 +
            value * 3,
        },
      });
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
          sustain: value,
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
            ) / 100;

          if (
            name ===
            "tempo"
          ) {
            transport.setTempo(
              50 +
                value * 100
            );
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