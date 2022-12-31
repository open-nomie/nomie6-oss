import fileDownload from 'js-file-download'

function download(filename, content, type) {
  fileDownload(content, filename)
}

export const selectFile = async (
  fileTypes: string
): Promise<{
  data: any
  file: File
}> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.accept = fileTypes
    input.type = 'file'
    input.id = 'file-uploader'
    input.addEventListener('change', change)
    input.style.height = '0px'
    input.style.width = '0px'
    input.style.overflow = 'hidden'
    input.style.position = 'absolute'
    input.style.bottom = '-300px'
    document.body.appendChild(input)
    input.click()

    const readFile = (file: File) => {
      input.remove()
      let reader = new FileReader()
      try {
        reader.onload = async (theFile: any) => {
          let fileData = theFile.target.result
          const uploaded: any = { data: null, file: null }
          uploaded.data = fileData
          uploaded.file = file
          resolve(uploaded)
          input.remove()
        }
        reader.readAsText(file)
      } catch (e) {
        alert(e.message)
      }
    }

    function change(evt: any) {
      let files = evt.target.files
      readFile(files[0])
    }
  })
}

export default {
  csv(filename = 'download.csv', content) {
    const type = 'text/csv'
    filename = filename.search('.json') == -1 ? `${filename}.csv` : filename
    download(filename, content, type)
  },
  // jsonpack(filename = 'download.json', content) {
  //   let packed = {
  //     jsonpack: true,
  //     content: jsonpack.pack(content),
  //   }
  //   download(filename, JSON.stringify(packed), 'text/json')
  // },
  json(filename = 'download.json', content) {
    // Converting to string if not already
    if (typeof content == 'object') {
      content = JSON.stringify(content)
    }
    filename = filename.search('.json') == -1 ? `${filename}.json` : filename
    download(filename, content, 'text/json')
  },
  text(filename = 'download.json', content) {
    const type = 'text/plain'
    download(filename, content, type)
  },
  file(file: File) {
    const url = window.URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.name);
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
