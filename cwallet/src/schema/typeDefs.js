import { gql } from 'apollo-server'

const typeDefs = gql`
  type Query {
    hello(something: String!): String!
  }
`

export default typeDefs
