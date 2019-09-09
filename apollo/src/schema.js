import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import graphql from 'graphql'
import graphqlTools from 'graphql-tools'

const { makeExecutableSchema } = graphqlTools
const { graphqlSync, introspectionQuery } = graphql


/* eslint-disable */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable */

const schemaPath = path.join(__dirname, '../', 'schema')

const types = directory => fs.readdirSync(directory)
  .filter(file => /.*\.graphql/gi.test(file))
  .map(file => path.join(directory, file))
  .reduce((xs, file) => [...xs, fs.readFileSync(file, 'utf8')] , [])



// const schema = mergeSchemas({
//   schemas: types(schemaPath),
// });

// export default schema
// console.log(111, types);

export default [ ...types(schemaPath) ]