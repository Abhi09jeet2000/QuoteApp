import { gql } from 'apollo-server'

const typeDefs = gql`
  type Query {
    users: [User]
    user(_id: ID!): User
    quotes: [QuoteWithName]
    iquote(by: ID!): [Quote]
    myprofile: User
  }

  type QuoteWithName {
    _id: ID!
    name: String
    by: IDName
  }

  type IDName {
    _id: ID
    firstName: String
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    quotes: [Quote]
  }

  type Quote {
    _id: ID!
    name: String!
    by: ID!
  }

  type Token {
    token: String!
  }

  type Mutation {
    signupUser(userNew: userInput!): User
    signinUser(userSignin: userSignInput): Token
    createQuote(name: String!): String
    deleteQuote(_id: ID!): String
    updateQuote(_id: ID!, name: String!): String
  }

  input userInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input userSignInput {
    email: String!
    password: String!
  }
`

export default typeDefs
