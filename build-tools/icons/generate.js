const fs = require('fs')
const icons = JSON.parse(fs.readFileSync('./build-tools/icons/icons.json', 'utf-8'))

icons.forEach((icon) => {
  let path = icon.path
  let name = icon.name
  let content = fs.readFileSync(`./${path}`, 'utf-8')
  content = content.replace('<svg ', `<svg height="{size}px" width="{size}px" `)
  console.log(`writing n-icons/${name}.svelte`)
  fs.writeFileSync(
    `./src/n-icons/${name}.svelte`,
    `
  <script lang="ts">
    export let size:number = 24;
  </script>
  ${content}
  `,
    'utf-8'
  )
})
