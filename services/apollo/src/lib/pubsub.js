import apolloServer from 'apollo-server'

const { PubSub } = apolloServer
const pubsub = new PubSub()

export default pubsub