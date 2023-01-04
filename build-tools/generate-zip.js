const path = require('path');
const archiver = require('archiver');
const fs = require('fs');
const ROOT = __dirname + "/../";

let pkgRaw = fs.readFileSync(`${ROOT}/package.json`, "utf-8") || "{}";
let pkg = JSON.parse(pkgRaw);
let version = pkg.version;

const SourceFolderName = "dist";
const TargetFolderName = "bin";
const zipName = "nomie6-oss."+ version + ".zip";
const source = path.join(ROOT, SourceFolderName);
const target = path.join(ROOT, TargetFolderName);

const zipDirectory = (sourceDir, targetDir, zipFile) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, 0744);
  }
  console.log('Zipped Distribution files will be saved in '+target);
  return new Promise((resolve, reject) => {
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile)
    }

    const outputZip = fs.createWriteStream(path.join(targetDir,zipFile))
    var archive = archiver('zip', {
      zlib: { level: 9 }
    })

    outputZip.on('close', function() {
      console.log('zipDirectory finished: ' + archive.pointer() + ' total bytes');
      console.log(zipName+' created');
      resolve()
    })

    outputZip.on('error', function(err) {
      reject(err)
    }) 

    archive.pipe(outputZip)
    archive.glob(
      '**/*',
      {
        cwd: sourceDir,
        ignore: ['**/*.zip'],
      },
      {}
    );
    console.log("Processing...");
    archive.finalize()
  })
}

async function ZipDistribution(){
  await zipDirectory(source,target,zipName);
  fs.copyFile(target+'/'+zipName, target+'/nomie6-oss.latest.zip', (err) => {
    if (err) throw err;
    console.log('nomie-oss_latest created');
  });
}

ZipDistribution();