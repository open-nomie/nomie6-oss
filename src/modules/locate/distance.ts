export default {
  between(latLng: Array<number>, latLng2: Array<number>, unit?: 'nm' | 'km'): number {
    unit = unit || 'km'
    const lat1 = latLng[0]
    const lng1 = latLng[1]
    const lat2 = latLng2[0]
    const lng2 = latLng2[1]

    if (lat1 == lat2 && lng1 == lng2) {
      return 0
    } else {
      let radlat1 = (Math.PI * lat1) / 180
      let radlat2 = (Math.PI * lat2) / 180
      let theta = lng1 - lng2
      let radtheta = (Math.PI * theta) / 180
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
      if (dist > 1) {
        dist = 1
      }
      dist = Math.acos(dist)
      dist = (dist * 180) / Math.PI
      dist = dist * 60 * 1.1515
      if (unit == 'km') {
        dist = dist * 1.609344
      } else {
        dist = dist * 0.8684
      }
      return dist
    }
  },
  furthest(latLngArray: Array<Array<Number>>, unit?: 'nm' | 'km'): number {
    unit = unit || 'nm'
    let max: number = 0
    if ((latLngArray || []).length > 1) {
      let root = latLngArray[0]
      latLngArray.forEach((latLng) => {
        let dist = this.between(latLng, root, unit)
        if (max < dist) {
          max = dist
        }
      })
    }
    return max
  },
}
