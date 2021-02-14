import createDocument, { assertDocument } from './document'
import { parseDid } from './utils'
import {
  UnavailableHypnsInstance,
  InvalidDid,
  IllegalCreate
} from './utils/errors'
import HyPNS from "hypns";

import * as once from 'events.once' // polyfill for nodejs events.once in the browser
// const once = require('events.once') // polyfill for nodejs events.once in the browser

class HypnsDid {
  constructor (node) {
    if(node){
      this.node = node
    }else{
      this.node = new HyPNS({ persist: false });
    }
  };

  assertInstance = (hypnsInstance) => {
    if (!hypnsInstance.writable || typeof hypnsInstance.publish !== 'function') throw new UnavailableHypnsInstance()

    return this.getDid(hypnsInstance)
  };

  create = async (hypnsInstance, operations) => {
    this.assertInstance(hypnsInstance)
    const did = this.getDid(hypnsInstance)
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
      this.assertInstance(hypnsInstance)
      const did = this.getDid(hypnsInstance)
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
    var copy
    try {
      copy = await this.node.open({ keypair: { publicKey }, temp: true })
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


  getDid = (hypnsInstance) => {
    return `did:hypns:${hypnsInstance.publicKey}`
  }

}

export const createHypnsDid = (node) => {
  return new HypnsDid(node)
}

export const getResolver = () => {

  const hypnsNode = new HyPNS({ persist: false })
  const HypnsDid = createHypnsDid(hypnsNode)

  async function resolve(
    did,
    parsed,
    didResolver
  ) {
    console.log(parsed)
    // {
    // method: 'mymethod', 
    // id: 'abcdefg', 
    // did: 'did:mymethod:abcdefg/some/path#fragment=123', 
    // path: '/some/path', 
    // fragment: 'fragment=123'
    // }
    const didDoc = await HypnsDid.resolve(did) // lookup doc
    // If you need to lookup another did as part of resolving this did document, the primary DIDResolver object is passed in as well
    const parentDID = await didResolver.resolve(...)
    //
    return didDoc
  }

  return { hypns: resolve }
}

export default createHypnsDid
