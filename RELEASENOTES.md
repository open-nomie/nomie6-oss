# v.5.0.77 - Apr 12 2020

## New

- Stats for People, Trackers, Context
- New Standalone Streak View
- Completely redesigned Stats
- Compared unlimited items
- Stacked Stats
- People Tracking
- File Browser
- Related Items
- Lots of UI Improvements
- Better Searching
- Clickable Map Pins
- CouchDB define your own database name
- Drag and Drop Item Sorting (boards, trackers)
- New Initial Tracker Designer
- Improved On Boarding
- Smaller Storage Data Chunks (now stored by the week instead of the month)

## Fixes

- Lots of UI improvements
- Lots of bug fixes

# v.4.6 - November 24 2019

## Enhancements

- Auto Complete when writing notes
- Log sharing - generate an image from a log
- Time + metric/imperial selection during on boarding
- default OZ trackers will become ML trackers if using metric
- Desktop enhancements; scrollbar removal, esc support for alerts
- Added Tips
- Board Refactoring / making it easier to understand
- Compare improvements

## Bugs

- Blockstack redirect bug
- ALL THE SCROLLBARS [#87]

# v.4.5 - Nov 15 2019

## Enhancements

- Board Sorting [#66]
- Rocking Trackers when selected - but before save [#79]
- Improved on-boarding process
- Added Launch counter (bottom of settings) - this will be used for an award/milestone thing
- Tracker Sorting on Mobile

## Fixes

- Aligning elements on empty boards [#74]
- Dark Theme Fixes [#75]
- Board/Tab terminology [#76]
- Putting labels ontop of Emojis for smaller screens and larger labels [#77]
- Fixed padding on small screens [#78]
- Tracker Editor X now closes modal
- Searching now clears if you track something
- Fixed Slider on Firefox and smaller screens
- Cleaned up Settings

# v.4.4.8 - Nov 10 2019

## Enhancements

- Improved on boarding

## Bug Fixes

- App Reload on new day
- Time visibility

# v.4.4.0 - Nov 2 2019

Fixes a lot of user submitted bugs, Chinese Translation, improved UI, and a handful of enhancements. Note worthy items includes:

## Enhancements

- Tracker Search
- Saving/Reusing Locations
- Double Emoji Support
- Tracker Buttons now show marks for todays logs (Nomie 2 port)
- Improved UI for capturing new logs, setting date and picking location
- Timers now support both seconds and "04:44:32" hh:mm:ss as a valid format
- Improved UI for phones with Notches
- Adding a better Sharing experience
- Nomie API auto imports every 4 minutes
- Stat Compare Chart added
- Partial Chinese Language support

## Bugs

- Hiding Scrollbars
- Map location more accurate
- Fixing underscores in tag name
- Fixing reload not reloading
- Fixed Hour of Day positivity bug

# v.4.3.0 - Sept 22 2019

This release focuses on new users coming to Nomie without previous nomie experience or data.

## Enhancements

- CSV Export
- New Onboarding flow to make things easier [#52]
- Added new Tracker Library with pre-build trackers [#52]
- Moved Stats to Modal - improved stat design
- Board Tabs are now optional

## Bugs

- Fixed button styling, added on action
- Added Positivity Back to Nomie https://shareking.s3.amazonaws.com/Screen-Recording-2019-09-08-16-26-52.mp4
- Changing verbage for Switching storage types [#51]
- Tagging Language Support Ticket [#50]
- Tagging Offline Support [#11] - Service workers now cache everything should work offline if using Local Storage
- Fixing double stones in UOM [#53]
- Fixing settings design
- Fixed Negative Number issues [#47]

# v.4.2.6 - Sat Set 7 2019

## Enhancements

- New All-in-one Log Editor
- Improved History / Search Tab
- Time of Day coloring
- Added 24 hour option [#41]

## Fixes

- Fixed Aggressive Sync [#42]
- Moving history point to last month bug [#44]
- Map Location always changing [#43]
- Cannot add Tracker when starting app [#45]

# v4.2.1 - Sat Aug 31 2019

## Enhancements

- Settings: Added Find and Replace - search for content in your notes and replace it.
- Nomie UOM: Added CNY to currency
- Overall: Moved vendor resources out of rollup, and into build script (to help hot reload times)
- Tracker Page: Added Visuals to show which trackers are "being saved"
- Tracker Editor: Made tag editable - after confirming the dangers
- Dark theme enhancements

## Bugs

- Lots of small bug fixes
- Made Nomie respect Safe Areas - like the iPhone X notch
- Double tapping records multiple times

## Partial

- Add a Photo - it's not working for iOS or Safari - so it's disabled for now.

# v4.1.16 - Sunday Aug 11 2019

## Bugs

- Null Username for blockstack storage - It will now show blockstack if a username is not available [#15](https://github.com/open-nomie/nomie/issues/15).
- Removed Tracker Emoji character limit to ensure all types of emojis can be used. [#17](https://github.com/open-nomie/nomie/issues/17)
- Dark Mode bugs
- Multiple pull requests to fix my horrible spelling
- Multiple small bug fixes

## Enhancements

- Dark Mode - Automatic detection if device is in Dark mode
- Day Reset - Nomie will now ask to be refreshed when a new day starts [#18](https://github.com/open-nomie/nomie/issues/18)
- Scroll to focused tab - new horiztonal-scroller that will scroll to the active child.
- Abstracted Storage Engine - should be easier to add new types of storage [#12](https://github.com/open-nomie/nomie/issues/12)

## Known Issues

- Cannot edit Tracker Data
- Plugins are incomplete
- Some times Today's data doesn't show on the main tracker board
