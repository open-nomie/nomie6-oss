import calculateCorrelation from 'calculate-correlation'

type MessageType = {
  data: {
    tag: string
    values: Array<number>
    dates: Array<string>
    compareTo: Array<{ tag: string; values: Array<number> }>
  }
}

onmessage = (e: MessageType) => {
  const message = e.data
  const base = message.values.map((v) => (isNaN(v) ? 0 : v))
  const scores = []

  Object.keys(message.compareTo).forEach((tag) => {
    const compareValues = message.compareTo[tag].map((v) => (isNaN(v) ? 0 : v))
    // let score = linearRegression(base, compareValues)
    // let score = -sampleCorrelation(base, compareValues)
    let score = calculateCorrelation(base, compareValues, { decimals: 5 })
    scores.push({ tag, score })
  })

  postMessage(scores)
}
