import { InvalidDid } from './errors'

export const parseDid = (did) => {
  const match = did.match(/did:(\w+):(\w+).*/)

  if (!match) {
    throw new InvalidDid(did)
  }

  return { method: match[1], identifier: match[2] }
}

export const isDidValid = (did) => {
  try {
    parseDid(did)

    return true
  } catch (err) {
    return false
  }
}

export const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(2)
