import apolloServer from 'apollo-server'

const { withFilter } = apolloServer

export default (type) => ({
  subscribe: withFilter(
    (_, __, { pubsub }) => pubsub.asyncIterator([type]),
    (payload, variables) => {
      if (!variables.filter) {
        return true
      }

      return Object.keys(payload[type]).every(key => {
        if (!variables.filter[key]) {
          return true
        }

        if (
          typeof payload[type][key] ==='object') {
          return payload[type][key].id.toString() === variables.filter[key]
        } else {
          if (payload[type][key] === variables.filter[key]) {
            return true
          }
        }

        return false
      })
    },
  )
})
