const findInFiles = require("find-in-files");
const fs = require("fs");

let strings = [];

/**
 * Generate the Base Lang from Nomie's source code.
 * @param {String} filler
 */
async function getBaseLang(filler) {
  let files = await findInFiles.find(/Lang.t(.*?)('\)|"\)|`\))/, "./src/", "(.svelte|.ts)$");
  //   console.log("Files", files);

  Object.keys(files).forEach((file) => {
    let matches = files[file].matches;
    matches = matches.map((str) => {
      let og = str;
      str = str
        .replace(/Lang.t\((\'|\")/, "")
        .replace(/(\'|\"|`)\)/, "")
        .replace(/("|')/, "");
      return str;
    });
    strings = [...strings, ...matches];
  });

  return stringsToObject(strings, filler);
}

async function generateModule(content) {
  if (content.Lang) {
    delete content.Lang;
  }
  return `export default {
    name: "base",
    author: "Brandon",
    translation: ${JSON.stringify(content, null, 2)}
  }`;
}

async function generate(filler) {
  const base = await getBaseLang(filler);
  fs.writeFileSync("./artifacts/lang.json", JSON.stringify(base, null, 2), "UTF-8");
  return await generateModule(base);
}

async function main(id, filler = undefined, test = false) {
  const module = await generate(filler);

  if (test) {
    fs.writeFileSync(`./artifacts/lang-${id}.ts`, module, "UTF-8");
  } else {
    fs.writeFileSync(`./src/lang/${id}.ts`, module, "UTF-8");
  }
  //   console.log("strings", strings);
}

function scrubWrappingQuotes(str) {
  str = str.trim();
  if (["`", `"`, `'`].indexOf(str.substr(0, 1)) > -1) {
    str = str.substring(1);
  }
  if (["`)", `")`, `')`].indexOf(str.substr(str.length - 2, 2)) > -1) {
    str = str.substr(0, str.length - 2);
  }
  return str;
}

/**
 * Take an array of cut strings
 * ["export.backup-description, 'some text here", "tracker.delete, `Delete"]
 * @param {Array} strArray
 * @param {String} filler
 */
function stringsToObject(strArray, filler) {
  let obj = {};
  strArray
    .filter((str) => str)
    .forEach((str) => {
      // Clean up the String to make it key value pair
      let split = str.split(" ");
      let name = split[0].replace(",", "");
      let value = null;
      if (split.length > 1) {
        value = scrubWrappingQuotes(split.join(" ").replace(split[0], "").trim());
      }
      // Make sure a real value was provided
      if (!`${value}`.trim().length) {
        value = null;
      }

      // Split the string
      let nameSplit = name.split(".");
      // Section is part 1
      let sectionKey = nameSplit[0];
      // Part key is the key term
      let partKey = nameSplit[1];
      // Create the holder if not already
      obj[sectionKey] = obj[sectionKey] || {};
      // If fillter (for filling everything with a single word (for testing))
      if (filler) {
        obj[sectionKey][partKey] = filler;
      } else {
        // Only put the value if it doesn't already exist
        obj[sectionKey][partKey] = obj[sectionKey][partKey] || value;
      }
    });
  return obj;
}
// Build test one
main("test", undefined, true);
// // Generate Tester Lang
main("test", "Nomie", false);
// // Generate Base
main("base", undefined, false);
