import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import graphql from 'graphql'
import graphqlTools from 'graphql-tools'

import { inspect } from 'util'

const { makeExecutableSchema } = graphqlTools
const { graphqlSync, introspectionQuery } = graphql


/* eslint-disable */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable */

const schemaPath = path.join(__dirname, '../', 'schema')

const getTypes = directory => fs.readdirSync(directory)
  .filter(file => /.*\.graphql/gi.test(file))
  .map(file => path.join(directory, file))
  .reduce((xs, file) => [...xs, fs.readFileSync(file, 'utf8')] , [])

const types = getTypes(schemaPath)

const typesDefs = graphqlSync(
  makeExecutableSchema({ typeDefs: types}),
  introspectionQuery
)

const processFields = (fields) => {
  const output = {}

  fields.forEach(field => {
    let type

    if (field.type.kind === 'LIST' && field.type.ofType && !field.type.ofType !== null) {
      type = `[${field.type.ofType.name}]`
    }
    if (field.type.kind === 'NON_NULL' && field.type.ofType && !field.type.ofType !== null) {
      type = field.type.ofType.name
    }

    type = type || field.type.name
    
    // if (field.name === 'valueToChangeOn'){
    //   console.log(field.name, type, inspect(field.type, {depth:6, colors:true}))
    // }
    

    output[field.name] = type
  })

  return output
}

const filterTypes = (graphqlType, allTypes) => {
  const filteredTypes = allTypes.data.__schema.types.filter(t => t.kind === graphqlType)

  return filteredTypes.map(f => {
    switch (f.kind) {
      case 'INPUT_OBJECT':
        return {
          name: f.name,
          fields: processFields(f.inputFields)
        }
      case 'OBJECT':
        return {
          name: f.name,
          fields: processFields(f.fields)
        }
    }
  })
}

export const typeDefs = {
  input: filterTypes('INPUT_OBJECT', typesDefs),
  output: filterTypes('OBJECT', typesDefs)
}

export default [ ...types]
