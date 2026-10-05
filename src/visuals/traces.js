const SVG_NS = "http://www.w3.org/2000/svg";

export function createVisualField(svg) {
  const MAX_LINES = 9;

  const W = 638;
  const H = 524;

  const margin = 45;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createGesture(voice) {
    const isCantus = voice === "cantus";

    // Cantus — крупнее и спокойнее
    // Counterpoint — компактнее и более подвижный
    const totalLength = isCantus
      ? random(180, 390)
      : random(90, 240);

    const segmentCount = Math.floor(
      random(
        isCantus ? 2 : 2,
        isCantus ? 4 : 5
      )
    );

    let x = random(margin, W - margin);
    let y = random(margin, H - margin);

    let angle = random(0, Math.PI * 2);

    let d = `M ${x} ${y}`;

    const segmentLength =
      totalLength / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      /*
        Каждый следующий кусок немного меняет направление,
        а не повторяет одну и ту же дугу.
      */

      const turn = isCantus
        ? random(-1.0, 1.0)
        : random(-1.5, 1.5);

      angle += turn;

      /*
        Иногда создаём более выраженный завиток.
      */

      if (Math.random() < 0.22) {
        angle += random(-1.2, 1.2);
      }

      const distance =
        segmentLength *
        random(0.65, 1.25);

      let endX =
        x +
        Math.cos(angle) *
        distance;

      let endY =
        y +
        Math.sin(angle) *
        distance;

      /*
        Не выпускаем линию за пределы поля.
      */

      endX = clamp(
        endX,
        margin,
        W - margin
      );

      endY = clamp(
        endY,
        margin,
        H - margin
      );

      /*
        Направление касательных.
        Чем больше normalOffset,
        тем сильнее изгиб.
      */

      const perpendicular =
        angle + Math.PI / 2;

      const normalOffset = isCantus
        ? random(-100, 100)
        : random(-65, 65);

      const c1x =
        x +
        Math.cos(angle) *
          distance *
          0.32 +
        Math.cos(perpendicular) *
          normalOffset;

      const c1y =
        y +
        Math.sin(angle) *
          distance *
          0.32 +
        Math.sin(perpendicular) *
          normalOffset;

      const c2x =
        x +
        Math.cos(angle) *
          distance *
          0.72 -
        Math.cos(perpendicular) *
          normalOffset *
          random(0.4, 1);

      const c2y =
        y +
        Math.sin(angle) *
          distance *
          0.72 -
        Math.sin(perpendicular) *
          normalOffset *
          random(0.4, 1);

      d += `
        C
        ${c1x} ${c1y},
        ${c2x} ${c2y},
        ${endX} ${endY}
      `;

      x = endX;
      y = endY;

      /*
        Если подошли близко к краю —
        разворачиваем дальнейшее движение.
      */

      if (
        x < margin + 30 ||
        x > W - margin - 30 ||
        y < margin + 30 ||
        y > H - margin - 30
      ) {
        angle += Math.PI * random(0.6, 1.2);
      }
    }

    return d;
  }

  function drawNote({
    voice,
    velocity = 0.5,
  }) {
    const path =
      document.createElementNS(
        SVG_NS,
        "path"
      );

    path.setAttribute(
      "d",
      createGesture(voice)
    );

    path.classList.add(
      "sound-line",
      voice
    );

    /*
      Немного индивидуальности каждой линии.
    */

    path.style.strokeWidth =
      voice === "cantus"
        ? random(0.8, 1.25)
        : random(0.55, 0.95);

    path.style.opacity =
      0.35 +
      velocity * 0.45;

    svg.appendChild(path);

    const length =
      path.getTotalLength();

    path.style.strokeDasharray =
      `${length}`;

    path.style.strokeDashoffset =
      `${length}`;

    /*
      Разная скорость прорисовки.
    */

    const duration =
      voice === "cantus"
        ? random(2.2, 4.2)
        : random(1.3, 3);

    path.style.transition = `
      stroke-dashoffset ${duration}s
      cubic-bezier(.22,.7,.2,1),
      opacity 1.8s ease
    `;

    requestAnimationFrame(() => {
      path.style.strokeDashoffset = "0";
    });

    /*
      Не даём центру забиваться.
    */

    const lines =
      svg.querySelectorAll(
        ".sound-line"
      );

    if (lines.length > MAX_LINES) {
      const oldest = lines[0];

      oldest.style.opacity = "0";

      setTimeout(() => {
        oldest.remove();
      }, 1800);
    }
  }

  function clear() {
    svg.innerHTML = "";
  }

  return {
    drawNote,
    clear,
  };
}