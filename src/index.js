import createDocument, { assertDocument } from './document'
import { parseDid } from './utils'
import {
  UnavailableHypnsInstance,
  InvalidDid,
  IllegalCreate
} from './utils/errors'
import HyPNS from "hypns";

import { default as once } from 'events.once' // polyfill for nodejs events.once in the browser

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
      process.nextTick(async () => {
        hypnsInstance.publish({ didDoc: content })
      })
      await once(hypnsInstance, 'update') // wait until the multifeed it up to date before returning
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
      copy = await this.node.open({ keypair: { publicKey } }) // , temp: true
      copy.on('error', (error) => {
        console.error('\nCopy error in Hypns resolve\n', error) // JSON.stringify(error, null, 2)
      })
      try {
        // const update = once(copy, 'update') // wait for the content to be updated from the remote peer
        await copy.ready()

        if(!copy.latest){
          await once(copy, 'update')
          // PUSHED TO USERLAND, they can decide how long to wait for a node to resolve
          // const timer = new Promise(function(resolve, reject) {
          //     setTimeout(() => resolve('timeout'), RESOLVE_TIMEOUT);
          // });
          // const result = await Promise.race([timer, update])
          // if (!result) throw new Error('No result') // did not resolve a DID doc from this did
          // if (result === 'timeout') throw new Error('Timeout error') // did not resolve a DID doc from this did
          // clearInterval(show);
          
        }

      } catch (error) {
        console.error('await update error', error)
      }

      if (!copy.latest) throw new Error('No latest result')
      if (!copy.latest.didDoc) throw new Error('No DID Doc property')

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

export const createHypnsDid = (node = false) => {
  return new HypnsDid(node)
}

// https://github.com/decentralized-identity/did-resolver
export function getResolver (opts = {}) {

  const HypnsDid = createHypnsDid()

  async function resolve(
    did,
    parsed,
    didResolver
  ) {
    // console.log({parsed})
    // {
    // method: 'mymethod', 
    // id: 'abcdefg', 
    // did: 'did:mymethod:abcdefg/some/path#fragment=123', 
    // path: '/some/path', 
    // fragment: 'fragment=123'
    // }
    const didDoc = await HypnsDid.resolve(did) // lookup doc
    // If you need to lookup another did as part of resolving this did document, the primary DIDResolver object is passed in as well
    // const parentDID = await didResolver.resolve(...)
    return didDoc
  }

  return { hypns: resolve }
}

export default createHypnsDid
