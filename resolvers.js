// import { quotes, users } from './fakedb.js'
// import { randomBytes } from 'crypto'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const User = mongoose.model('User')
const Quote = mongoose.model('Quotes')

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const resolvers = {
  Query: {
    users: async () => await User.find({}),
    user: async (parent, args) => await User.findOne({ _id: args._id }),
    // users.find((ur) => ur._id == args._id),
    quotes: async () => await Quote.find({}).populate('by', '_id firstName'),
    iquote: async (parent, args) => await Quote.find({ by: args.by }),
    // quotes.filter((quote) => quote.by === args.by),
    myprofile: async (parent, args, context) => {
      if (!context.userId) {
        throw new Error('You must logged in')
      }
      return await User.findOne({ _id: context.userId })
    },
  },
  User: {
    quotes: async (ur) => await Quote.find({ by: ur._id }),
    // quotes.filter((quote) => quote.by === ur._id),
  },

  Mutation: {
    signupUser: async (parent, { userNew }) => {
      const user = await User.findOne({ email: userNew.email })
      if (user) {
        throw new Error('User already exists with that email')
      }
      const hashedPassword = await bcrypt.hash(userNew.password, 12)

      const newUser = new User({
        ...userNew,
        password: hashedPassword,
      })
      return await newUser.save()
    },
    signinUser: async (parent, { userSignin }) => {
      const user = await User.findOne({ email: userSignin.email })
      if (!user) {
        throw new Error('User does not exsits with that email')
      }
      const doMatch = await bcrypt.compare(userSignin.password, user.password)
      if (!doMatch) {
        throw new Error('Invalid email or password')
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
      return { token }
    },
    createQuote: async (parent, { name }, context) => {
      if (!context.userId) {
        throw new Error('You must be logged in')
      }
      const newQuote = new Quote({
        name,
        by: context.userId,
      })
      await newQuote.save()
      return 'Quote Saved Successfully'
    },
    deleteQuote: async (parent, { _id }, context) => {
      if (!context.userId) {
        throw new Error('You must logged in')
      }
      const quotefound = await Quote.findOne({ _id })

      if (context.userId !== quotefound.by.toString()) {
        throw new Error('You cannot delete')
      }
      await Quote.findByIdAndRemove(_id)
      return 'Deleted Success'
    },
    updateQuote: async (parent, { _id, name }, context) => {
      if (!context.userId) {
        throw new Error('You must logged in')
      }
      const quotefound = await Quote.findOne({ _id })
      // console.log(quotefound.by.toString(), context.userId)
      if (context.userId !== quotefound.by.toString()) {
        throw new Error('You cannot update')
      }
      await Quote.findByIdAndUpdate(_id, {
        $set: {
          name: name,
        },
      })
      return 'Quote Updated Successfully'
    },
  },
}

export default resolvers
