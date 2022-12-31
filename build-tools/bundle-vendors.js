const fs = require("fs");
const vendors = {
  js: [
    // "./vendors/pouchdb/pouchdb.min.js",
    "./vendors/leaflet/leaflet.js",
    "./vendors/leaflet/esri/esri-leaflet.js",
    "./vendors/leaflet/geocoder/esri-leaflet-geocoder.js",
  ],
  css: [
    "./vendors/leaflet/leaflet.css",
    "./vendors/leaflet/geocoder/esri-leaflet-geocoder.css",
  ],
};

function bundleJS() {
  let content = [];
  vendors.js.forEach((path) => {
    content.push(`// import ${path}`);
    content.push(fs.readFileSync(path, "UTF-8"));
  });
  fs.writeFileSync("./public/js/vendors.js", content.join("\n"), "UTF-8");
}

function bundleCSS() {
  let content = [];
  vendors.css.forEach((path) => {
    content.push(`/* import ${path} */`);
    content.push(fs.readFileSync(path, "UTF-8"));
  });
  fs.writeFileSync("./public/css/vendors.css", content.join("\n"), "UTF-8");
}

function main() {
  console.log("Bundling Vendor JS....");
  bundleJS();
  console.log("Bundling Vendor CSS....");
  bundleCSS();
}

main();
