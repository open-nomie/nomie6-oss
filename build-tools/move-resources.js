// let copy = require('copy')
let move = [
  {
    src: 'node_modules/leaflet/dist/**/*',
    dest: 'vendors/leaflet',
  },
  // {
  //   src: "node_modules/pouchdb/dist/**/*",
  //   dest: "vendors/pouchdb",
  // },
  {
    src: 'node_modules/esri-leaflet/dist/**/*',
    dest: 'vendors/leaflet/esri',
  },
  {
    src: 'node_modules/esri-leaflet-geocoder/dist/**/*',
    dest: 'vendors/leaflet/geocoder',
  },
]

console.log('Moving Vendor Resources....')

// let copyp = (to, from) => {
//   return new Promise((resolve, reject) => {
//     copy(to, from, (err, files) => {
//       if (!err) {
//         resolve(files)
//       } else {
//         reject(err)
//       }
//     })
//   })
// }

// move.forEach(async (transport) => {
//   await copyp(transport.src, transport.dest)
// })
