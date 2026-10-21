import test from "node:test";
import assert from "node:assert/strict";
import { PLAZA_SCENES, describeObject, fallbackMarkup, questProgress } from "../js/scene.js";

test("every plaza object points at a real phrase", () => {
  for (const scene of Object.values(PLAZA_SCENES)) {
    assert.ok(scene.quest.length >= 3);
    for (const object of scene.objects) {
      const described = describeObject(object);
      assert.ok(described.phrase, object.phraseId);
      assert.ok(described.es);
    }
    for (const step of scene.quest) {
      assert.ok(scene.objects.some((object) => object.key === step.key), step.key);
    }
  }
});

test("quest progress completes only after every step", () => {
  const start = questProgress("cafe", []);
  assert.equal(start.complete, false);
  assert.equal(start.next.key, "coffee");
  const mid = questProgress("cafe", ["coffee", "water"]);
  assert.equal(mid.done, 2);
  assert.equal(mid.next.key, "check");
  const done = questProgress("cafe", ["coffee", "water", "check"]);
  assert.equal(done.complete, true);
  assert.equal(done.next, null);
});

test("fallback markup escapes object labels", () => {
  const html = fallbackMarkup({
    id: `cafe"><img src=x>`,
    objects: [{ key: `coffee"><img src=x>`, phraseId: "Café::Un café, por favor" }]
  });
  assert.equal(html.includes("<img"), false);
  assert.match(html, /&quot;|&lt;/);
});
