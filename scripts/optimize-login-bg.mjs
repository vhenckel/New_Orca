import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public", "images");
const input = path.join(publicDir, "login-bg.png");
const output = path.join(publicDir, "login-bg.webp");

await sharp(input)
  .webp({ quality: 82 })
  .toFile(output);

console.log("Created public/images/login-bg.webp");
