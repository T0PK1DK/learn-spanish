import { findPhrase } from "./data/sets.js";

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

function fallbackMarkup(scene) {
  const items = scene.objects
    .map((object) => {
      const item = describeObject(object);
      return `<button type="button" class="hotspot" data-plaza-key="${item.key}">
        <strong>${item.es}</strong>
        <span>${item.en}</span>
      </button>`;
    })
    .join("");
  return `<div class="plaza-fallback plaza-${scene.id}"><div class="hotspots">${items}</div></div>`;
}

function buildWorld(THREE, sceneId) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sceneId === "street" ? 0x87a0b5 : sceneId === "market" ? 0x2a221c : 0x1c1712);
  scene.fog = new THREE.Fog(scene.background, 10, 26);

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x2a2118, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe2b0, 1.15);
  sun.position.set(4, 8, 3);
  sun.castShadow = true;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x40352c, 0.35));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 22),
    new THREE.MeshStandardMaterial({
      color: sceneId === "street" ? 0x6d6a66 : sceneId === "market" ? 0x5a4634 : 0x3a2b20,
      roughness: 0.9
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const addBox = (w, h, d, x, y, z, color, extra = {}) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra.material })
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (extra.userData) mesh.userData = extra.userData;
    scene.add(mesh);
    return mesh;
  };

  if (sceneId === "cafe") {
    addBox(12, 4.2, 0.3, 0, 2.1, -4.2, 0x4a3326);
    addBox(0.3, 4.2, 8, -5.6, 2.1, -0.4, 0x3c291f);
    addBox(5.4, 1.1, 1.4, -1.2, 0.55, -2.4, 0x2b211b);
    addBox(1.6, 0.12, 1.6, 2.1, 0.72, 0.6, 0x5b3d2a);
    addBox(0.18, 0.72, 0.18, 1.5, 0.36, 0.1, 0x3a281c);
    addBox(0.18, 0.72, 0.18, 2.7, 0.36, 0.1, 0x3a281c);
  } else if (sceneId === "market") {
    addBox(8, 0.12, 2.4, 0, 1.9, -2.2, 0xa85a32);
    addBox(0.16, 1.9, 0.16, -3.6, 0.95, -1.4, 0x4a3424);
    addBox(0.16, 1.9, 0.16, 3.6, 0.95, -1.4, 0x4a3424);
    addBox(7.2, 0.7, 1.6, 0, 0.35, -2.0, 0x6a4a32);
  } else {
    addBox(1.4, 2.6, 3.2, -4.2, 1.3, -1.6, 0x8d6b4a);
    addBox(1.8, 3.4, 2.4, 4.4, 1.7, -2.2, 0x6d7c86);
    addBox(6, 0.08, 1.4, 0, 0.05, 0.4, 0x8a8680);
  }

  const pickables = [];
  const layout = {
    cafe: [
      ["coffee", 0.18, 0.22, 0.18, -1.6, 1.22, -2.0],
      ["milk", 0.18, 0.22, 0.18, -0.9, 1.22, -2.05],
      ["water", 0.14, 0.28, 0.14, -0.2, 1.25, -1.9],
      ["juice", 0.16, 0.26, 0.16, 0.5, 1.24, -2.1],
      ["bread", 0.42, 0.12, 0.24, 2.1, 0.84, 0.55],
      ["check", 0.36, 0.02, 0.24, 2.35, 0.8, 0.95],
      ["menu", 0.7, 0.9, 0.04, 2.8, 1.6, -2.3]
    ],
    market: [
      ["apples", 0.7, 0.28, 0.5, -2.2, 0.85, -1.85],
      ["tomatoes", 0.7, 0.28, 0.5, -1.1, 0.85, -1.85],
      ["rice", 0.7, 0.22, 0.5, 0.1, 0.82, -1.85],
      ["fish", 0.7, 0.18, 0.46, 1.3, 0.8, -1.85],
      ["meat", 0.7, 0.2, 0.46, 2.4, 0.81, -1.85],
      ["price", 0.34, 0.34, 0.08, -0.4, 1.25, -1.15],
      ["cash", 0.4, 0.16, 0.24, 1.6, 0.82, -1.1]
    ],
    street: [
      ["left", 0.16, 0.7, 0.5, -1.7, 1.15, 0.2],
      ["right", 0.16, 0.7, 0.5, 1.7, 1.15, 0.2],
      ["straight", 0.5, 0.16, 0.16, 0, 1.4, -1.6],
      ["bath", 0.7, 1.2, 0.4, -3.5, 0.7, -0.2],
      ["lost", 0.36, 0.7, 0.36, 0.2, 0.45, 1.3],
      ["airport", 1.1, 0.55, 0.7, 4.3, 2.15, -2.1]
    ]
  };

  for (const [key, w, h, d, x, y, z] of layout[sceneId]) {
    const meta = PLAZA_SCENES[sceneId].objects.find((object) => object.key === key);
    const mesh = addBox(w, h, d, x, y, z, meta.color, {
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
    const height = Math.max(260, Math.round(width * 0.72));
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 40);
    camera.position.set(0.4, 3.1, 6.2);
    camera.lookAt(0, 0.8, -1);

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
      const radius = 6.4;
      camera.position.set(
        Math.sin(yaw) * radius,
        2.6 + pitch * 2.4,
        Math.cos(yaw) * radius
      );
      camera.lookAt(0, 0.7, -1);
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
      const nextH = Math.max(260, Math.round(nextW * 0.72));
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
