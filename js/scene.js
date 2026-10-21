import { findPhrase } from "./data/sets.js";
import { escapeHtml } from "./util.js";

export const PLAZA_SCENES = {
  cafe: {
    id: "cafe",
    title: "Café",
    blurb: "Order something, then ask for the check.",
    quest: [
      { key: "coffee", phraseId: "Café::Un café, por favor" },
      { key: "water", phraseId: "Café::Agua, por favor" },
      { key: "check", phraseId: "Café::La cuenta, por favor" }
    ],
    objects: [
      { key: "coffee", phraseId: "Café::Un café, por favor", color: 0x4a2a1a },
      { key: "milk", phraseId: "Café::Un café con leche", color: 0xd8c4a8 },
      { key: "water", phraseId: "Café::Agua, por favor", color: 0x7ec8e3 },
      { key: "juice", phraseId: "Café::Un jugo de naranja", color: 0xe07a2f },
      { key: "bread", phraseId: "Food::El pan", color: 0xc48a4a },
      { key: "check", phraseId: "Café::La cuenta, por favor", color: 0xf4f1ea },
      { key: "menu", phraseId: "Food::¿Qué recomienda?", color: 0x2f4a38 }
    ]
  },
  market: {
    id: "market",
    title: "Mercado",
    blurb: "Point at food and ask what it costs.",
    quest: [
      { key: "apples", phraseId: "Market::Las manzanas" },
      { key: "price", phraseId: "Basics::¿Cuánto cuesta?" },
      { key: "cash", phraseId: "Market::En efectivo" }
    ],
    objects: [
      { key: "apples", phraseId: "Market::Las manzanas", color: 0xc23b3b },
      { key: "tomatoes", phraseId: "Market::Los tomates", color: 0xd4552b },
      { key: "rice", phraseId: "Food::El arroz", color: 0xe8d8b0 },
      { key: "fish", phraseId: "Food::El pescado", color: 0x6f8ea8 },
      { key: "meat", phraseId: "Food::La carne", color: 0x8a3a32 },
      { key: "price", phraseId: "Basics::¿Cuánto cuesta?", color: 0xc4a574 },
      { key: "cash", phraseId: "Market::En efectivo", color: 0x3f6b46 }
    ]
  },
  street: {
    id: "street",
    title: "Calle",
    blurb: "Ask for the bathroom and follow the signs.",
    quest: [
      { key: "lost", phraseId: "Around::Estoy perdido" },
      { key: "bath", phraseId: "Basics::¿Dónde está el baño?" },
      { key: "right", phraseId: "Around::A la derecha" }
    ],
    objects: [
      { key: "left", phraseId: "Around::A la izquierda", color: 0x3d5a80 },
      { key: "right", phraseId: "Around::A la derecha", color: 0x3d5a80 },
      { key: "straight", phraseId: "Around::Todo recto", color: 0x588157 },
      { key: "bath", phraseId: "Basics::¿Dónde está el baño?", color: 0x7b4b2a },
      { key: "lost", phraseId: "Around::Estoy perdido", color: 0x9a4c4c },
      { key: "airport", phraseId: "Around::El aeropuerto", color: 0x4a6274 }
    ]
  }
};

export function sceneList() {
  return Object.values(PLAZA_SCENES);
}

export function describeObject(meta) {
  const phrase = findPhrase(meta.phraseId);
  return {
    ...meta,
    phrase,
    es: phrase?.es || meta.key,
    en: phrase?.en || "",
    hint: phrase?.hint || "",
    exampleEs: phrase?.exampleEs || "",
    exampleEn: phrase?.exampleEn || ""
  };
}

export function nextQuestStep(sceneId, foundKeys) {
  const scene = PLAZA_SCENES[sceneId];
  if (!scene) return null;
  return scene.quest.find((step) => !foundKeys.includes(step.key)) || null;
}

export function questProgress(sceneId, foundKeys) {
  const scene = PLAZA_SCENES[sceneId];
  if (!scene) return { done: 0, total: 0, complete: false, next: null };
  const next = nextQuestStep(sceneId, foundKeys);
  return {
    done: scene.quest.filter((step) => foundKeys.includes(step.key)).length,
    total: scene.quest.length,
    complete: !next,
    next
  };
}

export function fallbackMarkup(scene) {
  const items = scene.objects
    .map((object) => {
      const item = describeObject(object);
      return `<button type="button" class="hotspot" data-plaza-key="${escapeHtml(item.key)}">
        <strong>${escapeHtml(item.es)}</strong>
        <span>${escapeHtml(item.en)}</span>
      </button>`;
    })
    .join("");
  return `<div class="plaza-fallback plaza-${escapeHtml(scene.id)}"><div class="hotspots">${items}</div></div>`;
}

function buildWorld(THREE, sceneId) {
  const scene = new THREE.Scene();
  const sky = sceneId === "street" ? 0x8ec5e8 : sceneId === "market" ? 0xf2d7b0 : 0xf0d8b8;
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 16, 32);

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6a4a32, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d0, 1.35);
  sun.position.set(5, 9, 4);
  sun.castShadow = true;
  scene.add(sun);
  const lamp = new THREE.PointLight(0xffe0b0, 1.1, 14);
  lamp.position.set(0.4, 3.2, 1.2);
  scene.add(lamp);

  const addBox = (w, h, d, x, y, z, color, extra = {}) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.04,
        emissive: extra.glow ? new THREE.Color(color) : 0x000000,
        emissiveIntensity: extra.glow ? 0.12 : 0
      })
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (extra.userData) mesh.userData = extra.userData;
    scene.add(mesh);
    return mesh;
  };

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({
      color: sceneId === "street" ? 0x9aa0a6 : sceneId === "market" ? 0xc4a574 : 0xd7b48a,
      roughness: 0.85
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  if (sceneId === "cafe") {
    addBox(14, 5.2, 0.28, 0, 2.6, -4.6, 0xe8c9a0);
    addBox(0.28, 5.2, 10, -6.4, 2.6, 0.2, 0xe3be93);
    addBox(6.4, 1.25, 1.7, -1.1, 0.62, -2.5, 0x6b4530);
    addBox(6.2, 0.08, 1.5, -1.1, 1.28, -2.45, 0x3e2a1f);
    addBox(2.1, 0.14, 2.1, 2.4, 0.78, 1.1, 0x8a5a38);
    addBox(0.16, 0.78, 0.16, 1.55, 0.39, 0.4, 0x5a3a24);
    addBox(0.16, 0.78, 0.16, 3.25, 0.39, 0.4, 0x5a3a24);
    addBox(0.16, 0.78, 0.16, 1.55, 0.39, 1.75, 0x5a3a24);
    addBox(0.16, 0.78, 0.16, 3.25, 0.39, 1.75, 0x5a3a24);
  } else if (sceneId === "market") {
    addBox(10, 0.16, 3.2, 0, 2.35, -2.1, 0xd36a32);
    addBox(0.18, 2.35, 0.18, -4.4, 1.17, -1.1, 0x7a4d2e);
    addBox(0.18, 2.35, 0.18, 4.4, 1.17, -1.1, 0x7a4d2e);
    addBox(9, 0.85, 2, 0, 0.42, -1.9, 0x8b5a36);
  } else {
    addBox(2.2, 3.4, 3.6, -4.6, 1.7, -1.2, 0xe0b27a);
    addBox(2.4, 4.2, 2.8, 4.8, 2.1, -2.0, 0x8aa4b5);
    addBox(8, 0.1, 2.2, 0, 0.05, 0.6, 0xc5c1b8);
  }

  const pickables = [];
  const layout = {
    cafe: [
      ["coffee", 0.42, 0.46, 0.42, -2.2, 1.62, -2.15],
      ["milk", 0.42, 0.46, 0.42, -1.3, 1.62, -2.15],
      ["water", 0.32, 0.58, 0.32, -0.35, 1.68, -2.0],
      ["juice", 0.36, 0.54, 0.36, 0.55, 1.66, -2.15],
      ["bread", 0.7, 0.22, 0.42, 2.35, 0.95, 1.05],
      ["check", 0.55, 0.06, 0.38, 2.7, 0.9, 1.55],
      ["menu", 1.1, 1.3, 0.08, 3.4, 2.15, -2.35]
    ],
    market: [
      ["apples", 1.05, 0.5, 0.8, -2.8, 1.1, -1.7],
      ["tomatoes", 1.05, 0.5, 0.8, -1.4, 1.1, -1.7],
      ["rice", 1.05, 0.4, 0.8, 0, 1.05, -1.7],
      ["fish", 1.05, 0.34, 0.75, 1.4, 1.02, -1.7],
      ["meat", 1.05, 0.38, 0.75, 2.8, 1.04, -1.7],
      ["price", 0.62, 0.62, 0.1, -0.2, 1.55, -0.85],
      ["cash", 0.7, 0.28, 0.42, 1.8, 1.02, -0.8]
    ],
    street: [
      ["left", 0.22, 1.1, 0.8, -2.0, 1.4, 0.4],
      ["right", 0.22, 1.1, 0.8, 2.0, 1.4, 0.4],
      ["straight", 0.8, 0.22, 0.22, 0, 1.75, -1.4],
      ["bath", 1.1, 1.8, 0.55, -3.8, 0.95, 0.2],
      ["lost", 0.55, 1.05, 0.55, 0.15, 0.55, 1.6],
      ["airport", 1.6, 0.8, 1.0, 4.6, 2.7, -1.8]
    ]
  };

  for (const [key, w, h, d, x, y, z] of layout[sceneId]) {
    const meta = PLAZA_SCENES[sceneId].objects.find((object) => object.key === key);
    const mesh = addBox(w, h, d, x, y, z, meta.color, {
      glow: true,
      userData: { pickable: true, ...describeObject(meta) }
    });
    pickables.push(mesh);
  }

  return { scene, pickables };
}

export async function mountPlaza(host, { sceneId = "cafe", onPick, onMiss } = {}) {
  const sceneMeta = PLAZA_SCENES[sceneId] || PLAZA_SCENES.cafe;
  host.innerHTML = "";
  host.classList.add("plaza-host");

  try {
    const THREE = await import("three");
    const width = host.clientWidth || 360;
    const height = Math.max(380, Math.round(width * 0.78));
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
    camera.position.set(0.2, 2.6, 5.2);
    camera.lookAt(0, 1.0, -1.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const { scene, pickables } = buildWorld(THREE, sceneMeta.id);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let selected = null;
    let dragging = false;
    let lastX = 0;
    let originX = 0;
    let yaw = 0.18;
    let pitch = 0.18;
    let frame = 0;
    let alive = true;

    const applyCamera = () => {
      const radius = 5.4;
      camera.position.set(
        Math.sin(yaw) * radius,
        2.3 + pitch * 1.8,
        Math.cos(yaw) * radius
      );
      camera.lookAt(0, 1.0, -1.1);
    };
    applyCamera();

    const paint = () => {
      if (!alive) return;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(paint);
    };
    paint();

    const pick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables, false)[0];
      if (!hit) {
        onMiss?.();
        return;
      }
      if (selected) selected.material.emissive?.setHex(0x000000);
      selected = hit.object;
      selected.material.emissive = new THREE.Color(0x4a3318);
      selected.material.emissiveIntensity = 0.45;
      onPick?.(selected.userData);
    };

    const onDown = (event) => {
      dragging = true;
      lastX = event.clientX;
      originX = event.clientX;
    };
    const onMove = (event) => {
      if (!dragging) return;
      yaw += (event.clientX - lastX) * 0.008;
      lastX = event.clientX;
      applyCamera();
    };
    const onUp = (event) => {
      const dragged = Math.abs(event.clientX - originX) > 6;
      dragging = false;
      if (!dragged) pick(event);
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const onResize = () => {
      const nextW = host.clientWidth || width;
      const nextH = Math.max(380, Math.round(nextW * 0.78));
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };
    window.addEventListener("resize", onResize);

    return {
      kind: "webgl",
      dispose() {
        alive = false;
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.dispose();
        host.innerHTML = "";
      }
    };
  } catch {
    host.innerHTML = fallbackMarkup(sceneMeta);
    const onClick = (event) => {
      const button = event.target.closest("[data-plaza-key]");
      if (!button) {
        onMiss?.();
        return;
      }
      const meta = sceneMeta.objects.find((object) => object.key === button.dataset.plazaKey);
      onPick?.(describeObject(meta));
    };
    host.addEventListener("click", onClick);
    return {
      kind: "fallback",
      dispose() {
        host.removeEventListener("click", onClick);
        host.innerHTML = "";
      }
    };
  }
}
