import Exporter from './export'

export default async function exportData(onChange: Function): Promise<boolean> {
  const Export = new Exporter()
  return new Promise((resolve) => {
    Export.onChange((change) => {
      if (onChange) onChange(change)
    })
    Export.start()
      .then(() => {
        resolve(true)
      })
      .catch((e) => {
        resolve(false)
      })
  })
}
