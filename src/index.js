import createDocument, { assertDocument } from './document'
import { parseDid } from './utils'
import {
  UnavailableHypnsInstance,
  InvalidDid,
  IllegalCreate
} from './utils/errors'

// import { once } from 'events' // need polyfill for browsers
// import once from 'events.once' // polyfill for nodejs events.once in the browser
const once = require('events.once') // polyfill for nodejs events.once in the browser

class HyperDid {
  constructor (node) {
    this.node = node
  }

  create = async (hypnsInstance, operations) => {
    assertInstance(hypnsInstance)
    const did = getDid(hypnsInstance)
    if (!hypnsInstance.latest) {
    // if it fails to read, we are allowed to create it
      const document = createDocument(did)

      operations(document)

      return await this.publish(hypnsInstance, document.getContent())
    }

    // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate
    throw new IllegalCreate()
  }

  update = async (hypnsInstance, operations) => {
    try {
      assertInstance(hypnsInstance)
      const did = getDid(hypnsInstance)
      const content = hypnsInstance.latest.didDoc
      const document = createDocument(did, content)

      operations(document)

      return await this.publish(hypnsInstance, document.getContent())
    } catch (error) {
      throw new UnavailableHypnsInstance()
    }
  }

  publish = async (hypnsInstance, content) => {
    try {
      await hypnsInstance.publish({ didDoc: content, text: content })
      return content
    } catch (error) {
      console.error(error)
      throw new UnavailableHypnsInstance()
    }
  };

  resolve = async (did) => {
    const { identifier: publicKey } = parseDid(did)

    try {
      var copy = await this.node.open({ keypair: { publicKey }, temp: true })
      copy.on('error', (error) => {
        console.error('\nCopy error in Hypns resolve\n', error) // JSON.stringify(error, null, 2)
      })

      process.nextTick(async () => {
        try {
          await copy.ready()
        } catch (error) {
          console.error('next Tick', error)
        }
      })

      try {
        await once(copy, 'update') // wait for the content to be updated from the remote peer
      } catch (error) {
        console.error('await once error', error)
      }

      const content = copy.latest.didDoc

      assertDocument(content)
      return content
    } catch (err) {
      console.log('resolve Error: ', err)
      if (err.code === 'INVALID_DOCUMENT') {
        throw err
      }

      throw new InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
        originalError: err.message
      })
    } finally {
      await copy.close()
    }
  };
}

const assertInstance = (hypnsInstance) => {
  if (!hypnsInstance.writable || typeof hypnsInstance.publish !== 'function') throw new UnavailableHypnsInstance()

  return getDid(hypnsInstance)
}

export const getDid = (hypnsInstance) => {
  return `did:hyper:${hypnsInstance.publicKey}`
}

export const createHyperDid = (node) => {
  return new HyperDid(node)
}

// export default hyperDid
// module.exports = hyperDid
// module.exports = { createHyperDid, getDid }
