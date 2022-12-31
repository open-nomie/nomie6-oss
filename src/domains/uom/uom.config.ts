import type { IUOM } from './uom-types'

const UOMS: IUOM = {
  num: {
    singular: 'Count',
    plural: 'Count',
    symbol: '',
    type: 'general',
  },
  steps: {
    singular: 'Step',
    plural: 'Steps',
    symbol: 'steps',
    type: 'general',
  },
  bottles: {
    singular: 'Bottle',
    plural: 'Bottles',
    symbol: '',
    type: 'general',
  },
  reps: {
    singular: 'Rep',
    plural: 'Reps',
    symbol: '',
    type: 'general',
  },
  pages: {
    singular: 'Page',
    plural: 'Pages',
    symbol: '',
    type: 'general',
  },
  tabs: {
    singular: 'Tab',
    plural: 'Tabs',
    symbol: '',
    type: 'health',
  },
  calorie: {
    singular: 'Calorie',
    plural: 'Calories',
    symbol: 'cal',
    type: 'health',
  },
  kcal: {
    singular: 'Kcal',
    plural: 'Kcals',
    symbol: 'kcal',
    type: 'health',
  },

  capsules: {
    singular: 'Capsule',
    plural: 'Capsules',
    symbol: 'caps',
    type: 'health',
  },
  bpm: {
    singular: 'Beat Per Minute',
    plural: 'Beat Per Minute',
    symbol: 'bpm',
    type: 'health',
  },
  pain: {
    singular: 'Pain',
    plural: 'Pain',
    symbol: '',
    type: 'health',
  },
  percent: {
    singular: 'Percent',
    plural: 'Percent',
    symbol: '%',
    type: 'general',
    symbolAffix: 'post',
  },

  iu: {
    singular: 'International Unit',
    plural: 'International Units',
    symbolAffix: 'post',
    symbol: 'IU',
    type: 'general',
  },

  dollars: {
    singular: 'Dollar',
    plural: 'Dollars',
    symbol: '$',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '$' + v.toFixed(2)
    },
  },
  peso: {
    singular: 'Peso',
    plural: 'Peso',
    symbol: '$',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '$' + v.toFixed(2)
    },
  },
  franc: {
    singular: 'Franc',
    plural: 'Francs',
    symbol: 'Fr.',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return 'Fr. ' + v.toFixed(2)
    },
  },
  cpound: {
    singular: 'Pound',
    plural: 'Pounds',
    symbol: '£',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '£' + v.toFixed(2)
    },
  },
  rupee: {
    singular: 'Rupee',
    plural: 'Rupees',
    symbol: 'Rs.',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return 'Rs. ' + v.toFixed(2)
    },
  },
  yen: {
    singular: 'Yen',
    plural: 'Yen',
    symbol: '¥',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '¥' + v.toFixed(2)
    },
  },
  yuan: {
    singular: 'Yuan',
    plural: 'Yuan',
    symbol: '¥',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '¥' + v.toFixed(2)
    },
  },
  bitcoin: {
    singular: 'Bitcoin',
    plural: 'Bitcoins',
    type: 'currency',
    symbolAffix: 'pre',
    symbol: 'B',
  },
  euro: {
    singular: 'Euro',
    plural: 'Euros',
    symbol: '€',
    type: 'currency',
    symbolAffix: 'pre',
    display: function (v: number) {
      return '€' + v.toFixed(2)
    },
  },
  timer: {
    singular: 'Time',
    plural: 'Time',
    symbol: '',
    type: 'timer',
    symbolAffix: 'post',
    symbolSpace: false,
    display: function (v: any) {
      var secNum = parseInt(v, 10) // don't forget the second param
      var hours = Math.floor(secNum / 3600)
      var minutes = Math.floor((secNum - hours * 3600) / 60)
      var seconds = secNum - hours * 3600 - minutes * 60
      return !hours ? minutes + 'm ' + seconds + 's' : hours + 'h ' + minutes + 'm'
    },
  },
  sec: {
    singular: 'Second',
    plural: 'Seconds',
    symbol: 'secs',
    type: 'time',
    symbolAffix: 'post',
    symbolSpace: true,
    display: function (v: number) {
      if (v < 3600) {
        return v + 's'
      } else {
        return Math.round((v / 60) * 100) / 100 + 'm'
      }
    },
  },
  min: {
    singular: 'Minute',
    plural: 'Minutes',
    symbol: 'm',
    type: 'time',
    symbolAffix: 'post',
    symbolSpace: false,
    display: function (v: number) {
      if (v < 60) {
        return v + 'm'
      } else if (v > 60 && v < 1441) {
        return Math.round((v / 60) * 100) / 100 + 'h'
      } else if (v > 1440 && v < 10000) {
        return (v / 1440).toFixed(0) + 'd'
      } else {
        return (v / 1440).toFixed(0) + 'd'
      }
    },
  },
  hour: {
    singular: 'Hour',
    plural: 'Hours',
    symbol: 'hrs',
    type: 'time',
    symbolAffix: 'post',
    symbolSpace: false,
    display: function (v: number) {
      if (v < 168) {
        return Math.round(v * 100) / 100 + 'h'
      } else {
        return (v / 24).toFixed(0) + 'd'
      }
    },
  },
  day: {
    singular: 'Day',
    plural: 'Days',
    symbol: 'days',
    type: 'time',
  },
  mm: {
    singular: 'Millimeter',
    plural: 'Millimeters',
    symbol: 'mm',
    type: 'distance',
    system: 'metric',
  },
  cm: {
    singular: 'Centimeter',
    plural: 'Centimeters',
    symbol: 'cm',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'metric',
  },
  meter: {
    singular: 'Meter',
    plural: 'Meter',
    symbol: 'm',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'metric',
  },
  km: {
    singular: 'Kilometer',
    plural: 'Kilometers',
    symbol: 'km',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'metric',
    cousin: 'mile',
    convert(v: number) {
      if (v) {
        return v * 0.621371
      }
      return v
    },
  },
  inch: {
    singular: 'Inch',
    plural: 'Inches',
    symbol: 'in',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
  },
  degrees: {
    singular: 'Degree',
    plural: 'Degrees',
    symbol: '°',
    type: 'temperature',
    symbolAffix: 'post',
    symbolSpace: false,
  },
  celsius: {
    singular: 'Celsius',
    plural: 'Celsius',
    symbol: '°C',
    type: 'temperature',
    symbolAffix: 'post',
    symbolSpace: false,
    system: 'metric',
    cousin: 'fahrenheit',
  },
  kelvin: {
    singular: 'Kelvin',
    plural: 'Kelvin',
    symbol: 'K',
    type: 'temperature',
    symbolAffix: 'post',
    symbolSpace: false,
  },
  fahrenheit: {
    singular: 'Fahrenheit',
    plural: 'Fahrenheit',
    symbol: '°F',
    type: 'temperature',
    symbolAffix: 'post',
    symbolSpace: false,
    system: 'imperial',
    cousin: 'celcius',
  },
  foot: {
    singular: 'Foot',
    plural: 'Feet',
    symbol: 'ft',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
  },
  yard: {
    singular: 'Yard',
    plural: 'Yards',
    symbol: 'yrds',
    type: 'distance',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
  },
  mile: {
    singular: 'Mile',
    plural: 'Miles',
    symbol: 'mi',
    type: 'distance',
    symbolAffix: 'post',
    system: 'imperial',
    cousin: 'km',
    convert(v: number) {
      if (v) {
        return v / 0.621371
      }
      return v
    },
  },
  mcg: {
    singular: 'Microgram',
    plural: 'Micrograms',
    symbol: 'mcg',
    type: 'weight',
    symbolAffix: 'post',
  },
  mg: {
    singular: 'Milligram',
    plural: 'Milligrams',
    symbol: 'mg',
    type: 'weight',
    symbolAffix: 'post',
    system: 'metric',
  },
  gram: {
    singular: 'Gram',
    plural: 'Grams',
    symbol: 'g',
    type: 'weight',
    symbolAffix: 'post',
    system: 'metric',
    cousin: 'oz',
    convert(v: number) {
      if (v) {
        return v / 28.3495
      }
      return v
    },
  },
  kg: {
    singular: 'Kilogram',
    plural: 'Kilograms',
    symbol: 'kg',
    type: 'weight',
    symbolAffix: 'post',
    system: 'metric',
    cousin: 'pound',
    convert(v: number) {
      if (v) {
        return v / 0.453592
      }
      return v
    },
  },
  stone: {
    singular: 'Stone',
    plural: 'Stones',
    symbol: 'st',
    type: 'weight',
    system: 'metric',
  },
  oz: {
    singular: 'Ounce',
    plural: 'Ounces',
    symbol: 'oz',
    type: 'weight',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
    cousin: 'gram',
    convert(v: number) {
      if (v) {
        return v * 28.3495
      }
      return v
    },
  },
  pound: {
    singular: 'Pound',
    plural: 'Pounds',
    symbol: 'lbs',
    type: 'weight',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
    cousin: 'kg',
    convert(v: number) {
      if (v) {
        return v * 0.453592
      }
      return v
    },
  },
  cup: {
    singular: 'Cup',
    plural: 'Cups',
    symbol: 'cups',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
  },
  fluidounce: {
    singular: 'Fluid Ounce',
    plural: 'Fluid Ounces',
    symbol: 'oz',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
    cousin: 'milliliter',
    convert(v: number) {
      return v * 29.57353
    },
  },
  pint: {
    singular: 'Pint',
    plural: 'Pints',
    symbol: 'pint',
    type: 'volume',
  },
  deciliter: {
    singular: 'Deciliter',
    plural: 'Deciliters',
    symbol: 'dL',
    type: 'volume',
  },
  mdgl: {
    singular: 'Blood Sugar',
    plural: 'Blood Sugar',
    symbol: 'mg/dl',
    type: 'health',
    symbolAffix: 'post',
    symbolSpace: true,
  },
  quart: {
    singular: 'Quart',
    plural: 'Quarts',
    symbol: 'qt',
    type: 'volume',
    symbolAffix: 'post',
  },
  gallon: {
    singular: 'Gallon',
    plural: 'Gallons',
    symbol: 'gal',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: true,
    system: 'imperial',
    cousin: 'liter',
    convert(v) {
      return v !== 0 ? v * 3.78 : v
    },
  },
  liter: {
    singular: 'Liter',
    plural: 'Liters',
    symbol: 'L',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: false,
    system: 'metric',
    cousin: 'gallon',
    convert(v) {
      return v !== 0 ? v / 3.78 : v
    },
  },
  kiloliter: {
    singular: 'Kiloliter',
    plural: 'Kiloliters',
    symbol: 'kl',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: false,
    system: 'metric',
  },
  milliliter: {
    singular: 'Millilitre',
    plural: 'Millilitres',
    symbol: 'ml',
    type: 'volume',
    symbolAffix: 'post',
    symbolSpace: false,
    system: 'metric',
  },
}

export default UOMS
