import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "source-frames");
const OUTPUT_DIR = path.join(ROOT, "public", "matcha-sequence");
const FRAME_COUNT = 120;
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 85;

async function convertFrames() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Converting ${FRAME_COUNT} frames to WebP...`);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const sourceName = `ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;
    const sourcePath = path.join(SOURCE_DIR, sourceName);
    const outputName = `matcha_${String(i).padStart(3, "0")}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    if (!fs.existsSync(sourcePath)) {
      console.error(`Missing source frame: ${sourcePath}`);
      process.exit(1);
    }

    let pipeline = sharp(sourcePath);
    const meta = await pipeline.metadata();

    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
    }

    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outputPath);

    if ((i + 1) % 20 === 0 || i === FRAME_COUNT - 1) {
      console.log(`  ${i + 1}/${FRAME_COUNT} complete`);
    }
  }

  console.log(`Done. Output: ${OUTPUT_DIR}`);
}

convertFrames().catch((err) => {
  console.error(err);
  process.exit(1);
});
