const program = require('commander');
const fs = require('fs')

const newEngine = require('@comunica/actor-init-sparql').newEngine;
const myEngine = newEngine();

const FOAF = 'http://xmlns.com/foaf/0.1/'
const VCARD = 'http://www.w3.org/2006/vcard/ns#'


program
  .version('1.0.0')
  .command('fetch <config>')
  .action((config) => {
    fetch(config).then(() => process.exit(0))
  })    

program.parse(process.argv)


async function fetch (configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, {encoding: "utf-8"}))
  console.log('config', config)

  let profiles = []
  for (let id of config.team) {
    profiles.push(fetchProfile(id))
  }
  profiles = await Promise.all(profiles)

  
  if (!fs.existsSync('./_data/')){
    fs.mkdirSync('./_data/');
  }
  fs.writeFileSync('./_data/team.json', JSON.stringify(profiles, null, 2))
  console.log('Done')
}

async function fetchProfile(id) {
  console.log('getting', id)

  const properties = [
    {
      id: 'name',
      var: '?name',
      pred: FOAF+'name'
    }, {
      id: 'givenName',
      var: '?givenName',
      pred: FOAF+'givenName'
    }, {
      id: 'familyName',
      var: '?familyName',
      pred: FOAF+'familyName'
    }, {
      id: 'title',
      var: '?title',
      pred: VCARD+'title'
    }, {
      id: 'mbox',
      var: '?mbox',
      pred: FOAF+'mbox'
    }, {
      id: 'img',
      var: '?img',
      pred: FOAF+'img'
    }, 
  ]
  let profile = {}
  for (let property of properties) {
    profile[property.id] = await fetchProperty(id, property)
  }
  if (!profile.name) profile.name = profile.givenName + " " + profile.familyName
  
  console.log(profile)
  return profile
}

async function fetchProperty(id, property) {
  const result = await myEngine.query(`
    SELECT DISTINCT ${property.var} WHERE {
      <${id}> <${property.pred}> ${property.var} . 
    }`, { sources: [id] });

  // Consume results as an array (easier)
  const bindings = await result.bindings() || [];
  return bindings.map(e => e.get(property.var).value)[0]
}
