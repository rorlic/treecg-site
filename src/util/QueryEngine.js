const { default: data } = require('@solid/query-ldflex');


export const getProfileData = async (id) => {
  const name = `${await data[id]['foaf:name']}`
  const givenName = `${await data[id]['foaf:givenName']}`
  const familyName = `${await data[id]['foaf:familyName']}`
  const title = `${await data[id]['vcard:title']}`
  const mbox = `${await data[id]['foaf:mbox']}`
  const img = `${await data[id]['foaf:img']}`

  console.log('test', id, `${await data[id]}`, `${await data[id]['http://xmlns.com/foaf/0.1/name']}`, `${await data[id].name}`)

  if (!name) name = givenName + " " + familyName
  
  return { name, givenName, familyName, title, mbox, img }
}