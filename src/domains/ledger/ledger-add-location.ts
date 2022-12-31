import Location from '../locations/LocationClass'
import type NLog from '../nomie-log/nomie-log'

import { findNearestLocationHeavy } from '../locations/LocationStore'
import locate from '../../modules/locate/locate'
import { getRawPrefs } from '../preferences/Preferences'

/**
 * If the user has enabled location tracking, and we can get a location, then we'll add the location to
 * the log
 * @param {NLog} log - The log we're appending the location to
 * @returns A Promise that resolves to a log
 */
export async function logAppendLocationIfNeeded(log: NLog): Promise<NLog> {
  // Should we locate?
  let prefs = getRawPrefs();
  let shouldLocate = prefs.alwaysLocate;
  if (shouldLocate) {
    try {
      // Get the Location
      let theLoc: any = await locate()
      // make it a location
      let location = new Location({ lat: theLoc.latitude, lng: theLoc.longitude })
      // Find any favorited that are super close
      let nearest = findNearestLocationHeavy(location)
      // If we have a nearest and a name
      if (nearest && nearest.name) {
        location.name = nearest.name
      }
      if (location && !log.lat) {
        log.lat = location.lat
        log.lng = location.lng
        log.location = location.name
      }
      // Return the match - or the location if we didnt any favorites
      return log
    } catch (e) {
      // Any location errors
      console.error(`Non-fatal location error`, e.message)
      return log
    }
  } else {
    return log
  }
}
