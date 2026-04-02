/**
 * Strips comments from .ts/.tsx via TypeScript printer (AST-safe; preserves `https://` in templates).
 * Preserves /// reference directives in .d.ts.
 * .css: block comments removed via regex (careful with quoted strings).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function scriptKindFor(fileName) {
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (fileName.endsWith(".ts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.TS;
}

function stripTsWithPrinter(text, fileName) {
  const kind = scriptKindFor(fileName);
  const sf = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });
  return printer.printFile(sf);
}

function stripCssBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
    const before = text.slice(0, offset);
    const oddDouble = (before.match(/"/g) || []).length % 2 === 1;
    if (oddDouble) return match;
    return "";
  });
}

function processFile(absPath) {
  const ext = path.extname(absPath);
  const rel = path.relative(root, absPath);
  let text = fs.readFileSync(absPath, "utf8");
  const orig = text;

  if (ext === ".ts" || ext === ".tsx") {
    text = stripTsWithPrinter(text, path.basename(absPath));
  } else if (ext === ".css") {
    text = stripCssBlockComments(text);
    text = text.replace(/\n{3,}/g, "\n\n");
  } else {
    return false;
  }

  if (text !== orig) {
    fs.writeFileSync(absPath, text, "utf8");
    console.log(rel);
    return true;
  }
  return false;
}

function walk(dir) {
  const names = fs.readdirSync(dir, { withFileTypes: true });
  for (const n of names) {
    const p = path.join(dir, n.name);
    if (n.isDirectory()) {
      if (n.name === "node_modules" || n.name === "dist") continue;
      walk(p);
    } else if (/\.(ts|tsx|css)$/.test(n.name)) {
      processFile(p);
    }
  }
}

walk(path.join(root, "src"));
processFile(path.join(root, "vite.config.ts"));
