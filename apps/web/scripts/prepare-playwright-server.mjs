import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const standaloneAppRoot = path.join(appRoot, ".next", "standalone", "apps", "web");
const sourceStaticDir = path.join(appRoot, ".next", "static");
const targetStaticDir = path.join(standaloneAppRoot, ".next", "static");
const sourcePublicDir = path.join(appRoot, "public");
const targetPublicDir = path.join(standaloneAppRoot, "public");

function copyDir(source, target) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, force: true });
}

copyDir(sourceStaticDir, targetStaticDir);
copyDir(sourcePublicDir, targetPublicDir);
