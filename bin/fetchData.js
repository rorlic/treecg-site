const program = require('commander');
const fs = require('fs')


program
  .version('1.0.0')
  .command('fetch <config>')
  .action((config) => {
    fetch(config)
  })    

program.parse(process.argv)


async function fetch (configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, {encoding: "utf-8"}))
  console.log('config', config)

}

