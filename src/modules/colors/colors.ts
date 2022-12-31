import math from '../../utils/math/math'

const colors: Array<string> = [
  '#f44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#795548',
  '#607D8B',
  '#B39DDB',
  '#9FA8DA',
  '#90CAF9',
  '#81D4FA',
  '#80DEEA',
  '#80CBC4',
  '#A5D6A7',

  '#B0BEC5',
  '#e57373',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
  '#4FC3F7',
  '#4DD0E1',
  '#4DB6AC',
  '#81C784',
  '#AED581',
  '#DCE775',
  '#A1887F',
  '#90A4AE',
  '#ef5350',
  '#EC407A',
  '#AB47BC',
  '#7E57C2',
  '#5C6BC0',
  '#42A5F5',
  '#29B6F6',
  '#26C6DA',
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#8D6E63',
  '#78909C',
  '#f44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
  '#e53935',
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
  '#757575',
  '#546E7A',
  '#d32f2f',
  '#C2185B',
  '#7B1FA2',
  '#512DA8',
  '#303F9F',
  '#1976D2',
  '#0288D1',
  '#0097A7',
  '#00796B',
  '#388E3C',
  '#689F38',
  '#AFB42B',
  '#FBC02D',
  '#FFA000',
  '#F57C00',
  '#E64A19',
  '#5D4037',
  '#616161',
  '#455A64',
  '#c62828',
  '#AD1457',
  '#6A1B9A',
  '#4527A0',
  '#283593',
  '#1565C0',
  '#0277BD',
  '#00838F',
  '#00695C',
  '#2E7D32',
  '#558B2F',
  '#9E9D24',
  '#F9A825',
  '#FF8F00',
  '#EF6C00',
  '#D84315',
  '#4E342E',
  '#424242',
  '#37474F',
  '#b71c1c',
  '#880E4F',
  '#4A148C',
  '#311B92',
  '#1A237E',
  '#0D47A1',
  '#01579B',
  '#006064',
  '#004D40',
  '#1B5E20',
  '#33691E',
  '#827717',
  '#F57F17',
  '#FF6F00',
  '#E65100',
  '#BF360C',
  '#3E2723',
  '#212121',
  '#263238',
  '#ff8a80',
  '#FF80AB',
  '#EA80FC',
  '#B388FF',
  '#8C9EFF',
  '#82B1FF',
  '#E040FB',
  '#7C4DFF',
  '#536DFE',
  '#448AFF',
  '#40C4FF',

  '#64FFDA',
  '#69F0AE',

  '#D500F9',

  '#3D5AFE',
  '#2979FF',
  '#00B0FF',
  '#00E5FF',
  '#1DE9B6',
  '#00E676',

  '#d50000',
  '#C51162',
  '#AA00FF',
  '#6200EA',
  '#304FFE',
  '#2962FF',
  '#0091EA',
  '#00B8D4',
  '#00BFA5',
  '#00C853',
  '#64DD17',
  '#DD2C00',
]

export default colors
export const base = colors

export const randomColor = (): string => {
  return math.random(colors)
}

//stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const hex2rgba = (hex: string, alpha: number = 1): string => {
  let c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `,${alpha})`
  }
  return `rgba(155,155,155,${alpha})`
}

export const hex2rgb = (hex: string, alpha: number = 1): string => {
  let c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')
  }
  return `155,155,155`
}
