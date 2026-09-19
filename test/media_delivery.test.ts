import assert from "node:assert/strict";
import { applyDecision, Asset } from "../src/media_delivery.js";

const asset = Asset.parse({ id: "clip-17", sourceUrl: "https://media.example/clip-17.mp4", creatorId: "creator-4" });
assert.equal(applyDecision(asset, { name: "start_processing", assetId: "clip-17" }), "processing:clip-17");
assert.throws(() => applyDecision(asset, { name: "deliver_to_creator", assetId: "clip-17" }));
assert.equal(applyDecision(asset, { name: "deliver_to_creator", assetId: "clip-17" }, new Set(["clip-17"])), "delivered:creator-4");
console.log("media delivery decision test passed");
