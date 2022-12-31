const gitlog = require("gitlog").default;
const fs = require("fs");
const ROOT = __dirname + "/../";
const options = {
  repo: ROOT,
  number: 120
};

let currentRaw = fs.readFileSync(`${ROOT}/src/config/whatsNew.json`, "utf-8");
let current = JSON.parse(currentRaw);
let pkgRaw = fs.readFileSync(`${ROOT}/package.json`, "utf-8") || "{}";
let pkg = JSON.parse(pkgRaw);
let version = pkg.version;

const commits = gitlog(options);

let features = current.features || [];
let fixes = current.fixes || [];
let chores = current.chores || [];
let build_date = new Date();

commits.forEach((commit) => {
  if (commit.subject && commit.subject.search("fix:") > -1) {
    let title = commit.subject.replace("fix: ", "");
    if (!fixes.find((f) => f.title == title)) {
      fixes.unshift({ version, title });
    }
  }
  console.log(commit.subject);
  if (commit.subject && commit.subject.search("feat:") > -1) {
    let title = commit.subject.replace("feat: ", "");
    if (!features.find((f) => f.title == title)) {
      features.unshift({ version, title });
    }
  }
  // if (commit.subject && commit.subject.search("chore:") > -1) {
  //   let title = commit.subject.replace("chore: ", "");
  //   if (!chores.find((f) => f.title == title)) {
  //     chores.unshift({ version, title });
  //   }
  // }
});

fs.writeFileSync(`${ROOT}/src/config/whatsNew.json`, JSON.stringify({ features, fixes, chores, build_date }));
