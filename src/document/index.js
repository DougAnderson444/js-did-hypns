import { omitBy, isArray, isUndefined } from 'lodash'
import service from './service'
import publicKey from './publicKey'
import authentication from './authentication'
import { generateDocument, isEquivalentId, assertDocument } from './utils'

class Document {
    #content;

    constructor (content) {
      // https://w3c.github.io/did-core/#did-document-properties
      this.#content = {
        publicKey: [], // This property has been deprecated in favor or verificationMethod
        authentication: [],
        service: [], //	An ordered set of Service Endpoint maps (see Section § 5.1.3 Service properties).
        alsoKnownAs: [], // An ordered set of strings that conform to the rules of [RFC3986] for URIs.
        controller: [], // A string or an ordered set of strings that conform to the rules in Section § 3.1 DID Syntax.
        verificationMethod: [], // An ordered set of Verification Method maps (see Section § 5.1.2 Verification Method properties).
        authentication: [], // An ordered set of either Verification Method maps (see Section § 5.1.2 Verification Method properties) or strings that conform to the rules in Section § 3.2 DID URL Syntax.
        assertionMethod: [], //
        keyAgreement: [], //
        capabilityInvocation: [], //
        capabilityDelegation: [], //
        ...content
      }
    }

    getContent () {
      return omitBy(this.#content, (prop) => isUndefined(prop) || (isArray(prop) && prop.length === 0))
    }

    addPublicKey (props, options) {
      const { idPrefix } = { ...options }

      props.id = publicKey.createId(this.#content.id, props.id, { prefix: idPrefix })
      props.controller = props.controller || this.#content.id

      publicKey.assert(props, this.#content.publicKey)

      this.#content.publicKey.push(props)
      this.#refreshUpdated()

      return props
    }

    revokePublicKey (id) {
      const filter = this.#content.publicKey.filter((key) => !isEquivalentId(key.id, id, publicKey.separator))

      if (this.#content.publicKey.length === filter.length) {
        return
      }

      this.removeAuthentication(id)

      this.#content.publicKey = filter
      this.#refreshUpdated()
    }

    addAuthentication (auth) {
      const key = this.#content.publicKey.find((pk) => isEquivalentId(pk.id, auth, publicKey.separator)) || {}

      authentication.assert(key.id, this.#content.authentication)

      this.#content.authentication.push(key.id)
      this.#refreshUpdated()

      return key.id
    }

    removeAuthentication (id) {
      const filter = this.#content.authentication.filter((auth) => !isEquivalentId(id, authentication.parseId(auth), publicKey.separator))

      if (this.#content.authentication.length === filter.length) {
        return
      }

      this.#content.authentication = filter
      this.#refreshUpdated()
    }

    addService (props, options) {
      const { idPrefix } = { ...options }

      props.id = service.createId(this.#content.id, props.id, { prefix: idPrefix })

      service.assert(props, this.#content.service)

      this.#content.service.push(props)
      this.#refreshUpdated()

      return props
    }

    removeService (id) {
      const filter = this.#content.service.filter((srvc) => !isEquivalentId(srvc.id, id, service.separator))

      if (this.#content.service.length === filter.length) {
        return
      }

      this.#content.service = filter
      this.#refreshUpdated()
    }

    #refreshUpdated = () => {
      this.#content.updated = new Date().toISOString()
    }
}

const createDocument = (did, content) => {
  if (!content) {
    content = generateDocument(did)
  }

  return new Document(content)
}

export { assertDocument }

export default createDocument
