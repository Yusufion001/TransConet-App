const fs = require("fs");
const glob = require("glob");
const files = glob.sync("src/**/*.tsx");

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  let lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("<trhover:bg-blue-50 dark:hover:bg-slate-800/50>")) {
      // Look up to find the map variable
      let mapVar = "item";
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        let match = lines[j].match(/\.map\(\(?(.*?)[,)]/);
        if (match) {
          mapVar = match[1].trim();
          break;
        }
      }
      if (mapVar.includes("{")) {
        // destructured
        mapVar = "index"; // we don't have id easily, but wait, usually it's not destructured.
      }
      lines[i] = lines[i].replace(
        "<trhover:bg-blue-50 dark:hover:bg-slate-800/50>",
        `<tr key={\${mapVar}.id || \${mapVar} || Math.random()} className="hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">`,
      );
    }
  }
  content = lines.join("\n");
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Fixed", file);
  }
}
