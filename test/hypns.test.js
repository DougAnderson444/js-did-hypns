/* eslint-disable no-undef */
// import {
//   UnavailableHypnsInstance
// } from '../src/utils/errors'

const mockPublicKey =
  'dee2fc9db57f409cfa5edea42aa40790f3c1b314e3630a04f25b75ad42b71835'
const mockPrivateKey =
  '1e9813baf16eb415a61a56693b037d5aec294279b35a814aff239a0c61f71d3bdee2fc9db57f409cfa5edea42aa40790f3c1b314e3630a04f25b75ad42b71835'
const mockKeypair = {
  publicKey: mockPublicKey,
  secretKey: mockPrivateKey
}

const mockpersistPublicKey =
  'a9cccf7294b78c4ff18eacf98378644a2ef53d236c63cc284958dcb8aaee4488'
const mockpersistPrivateKey =
  '2dbaf25b261799a1bd7a2a9d3c1b0d809a6d57e299e26cb858c3b2f5c581bb86a9cccf7294b78c4ff18eacf98378644a2ef53d236c63cc284958dcb8aaee4488'
const mockNewKeypair = {
  publicKey: mockpersistPublicKey,
  secretKey: mockpersistPrivateKey
}

const mockDid = `did:hyper:${mockPublicKey}`
const mockNewDid = `did:hyper:${mockpersistPublicKey}`

const mockCreatedDocument = {
  '@context': 'https://w3id.org/did/v1',
  id: `${mockDid}`,
  created: '2019-03-18T15:55:38.636Z'
}

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect

const { createHyperDid, getDid } = require('../src')
const HyPNS = require('hypns')
var myNode = new HyPNS({ persist: false })
var hyperId = createHyperDid(myNode)

// handle shutdown gracefully
const closeHandler = async () => {
  console.log('Shutting down...')
  await myNode.close()
  process.exit()
}

process.on('SIGINT', closeHandler)
process.on('SIGTERM', closeHandler)
process.on('warning', (warning) => {
  // console.warn(warning.name);    // Print the warning name
  // console.warn(warning.message); // Print the warning message
  console.warn(warning.stack) // Print the stack trace
})
process.on('error', function (err) {
  console.log('UNCAUGHT EXCEPTION - keeping process alive:', err) // err.message is "foobar"
})

global.Date = class Date {
  constructor () {
    this.toISOString = () => '2019-03-18T15:55:38.636Z'
  }
}

const dateNowStub = () => 1552924538636
global.Date.now = dateNowStub

describe('All tests', () => {
  describe('factory', () => {
    it('should create hyperId with all specification methods', () => {
      expect(typeof hyperId.resolve).to.equal('function')
      expect(typeof hyperId.create).to.equal('function')
      expect(typeof hyperId.update).to.equal('function')
      expect(typeof getDid).to.equal('function')
    })

    it('should not create hyperId if hypnsInstance is not a function', () => {
      const operations = () => {}
      expect(hyperId.create('foo', operations)
      ).to.eventually.be.rejectedWith('Hypns Instance is unavailable.')
    })

    it('should not create hyperId if hypns is not writeable', () => {
      expect(
        hyperId.create({ writeable: () => false })
      ).to.eventually.be.rejectedWith('Hypns Instance is unavailable.')
    })
  })

  describe('create', () => {
    it('should create successfully on empty instance', async () => {
      const operations = () => {}
      const mockEmptyInstance = await myNode.open({ keypair: mockKeypair })
      await mockEmptyInstance.ready()
      // console.log(mockEmptyInstance)
      const document = await hyperId.create(mockEmptyInstance, operations)
      expect(document).to.deep.equal(mockCreatedDocument)

      describe('did', () => {
        it('should return a did', () => {
          expect(getDid(mockEmptyInstance)).to.equal(mockDid)
        })
      })

      describe('update', () => {
        it('should update successfully on non-empty drive', async () => {
          const content = await hyperId.update(mockEmptyInstance, operations)
          expect(content).to.deep.equal(mockCreatedDocument)
        })

        it('update should fail if no document available', async () => {
          const operations = () => {}
          expect(
            hyperId.update({ latest: { didDoc: null } }, operations)
          ).to.eventually.be.rejectedWith('Hypns Instance is unavailable.')
        })
      })
    })

    it('create should fail if document already exists', () => {
      const operations = () => {}
      expect(hyperId.create({ latest: 'a did doc', writable: true }, operations))
        .to.eventually.be.rejectedWith('Hypns Instance is unavailable.')
    })

    it('create should fail on an empty drive if a document operation fails', async () => {
      const operations = () => {
        throw new Error('Operation Failed')
      }
      const mockEmptyInstance = await myNode.open()
      await mockEmptyInstance.ready()
      expect(
        hyperId.create(mockEmptyInstance, operations)
      ).to.eventually.be.rejectedWith('Operation Failed')
    })
  })
  describe('resolve', () => {
    it('should resolve successfully', function () {
      hyperId.resolve(mockNewDid).then((document) => {
        expect(document).to.deep.equal(mockCreatedDocument)
      })
    })
  })
})
