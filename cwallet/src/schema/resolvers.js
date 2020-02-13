const resolvers = {
  Query: {
    hello: async (root, { something }) => `Hello ${something}!`
  }
}

export default resolvers
