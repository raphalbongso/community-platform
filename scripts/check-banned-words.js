const fs = require("fs");
const path = require("path");

const BANNED_WORDS = [
  "invest", "investor", "investment",
  "returns", "return on",
  "dividend", "dividends",
  "profit", "profits", "profit share", "profit-share",
  "yield", "yields",
  "roi", "r.o.i.",
  "% raised", "percent raised", "percentage raised",
  "funding goal", "funding target",
  "backed", "backer", "backers",
  "crowdfund", "crowdfunding",
  "equity", "stake",
];

const SCAN_DIRS = [
  path.join(__dirname, "..", "apps", "community-web", "src"),
  path.join(__dirname, "..", "packages", "ui", "src"),
];

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        results.push(filePath);
      }
    }
  } catch {}
  return results;
}

let violations = 0;

for (const dir of SCAN_DIRS) {
  const files = walk(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8").toLowerCase();
    for (const word of BANNED_WORDS) {
      if (content.includes(word.toLowerCase())) {
        const rel = path.relative(process.cwd(), file);
        console.error(`VIOLATION: "${word}" found in ${rel}`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\nFound ${violations} banned word violation(s).`);
  process.exit(1);
} else {
  console.log("No banned words found.");
}
