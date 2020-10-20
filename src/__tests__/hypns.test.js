/* eslint-disable no-undef */
import createDidHyper, { getDid } from '../index'
import {
  mockDid,
  mockCreatedDocument,
  createMockEmptyHypnsInstance
} from './mocks'
import {
  UnavailableHypnsInstance
} from '../utils/errors'

let mockEmptyInstance

process.on('warning', (warning) => {
  // console.warn(warning.name);    // Print the warning name
  // console.warn(warning.message); // Print the warning message
  console.warn(warning.stack) // Print the stack trace
})

global.Date = class Date {
  constructor () {
    this.toISOString = () => '2019-03-18T15:55:38.636Z'
  }
}

const dateNowStub = jest.fn(() => 1552924538636)
global.Date.now = dateNowStub

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  generateRandomString: jest.fn(() => 'randomString')
}))

const HyPNS = require('hypns')
var myNode = new HyPNS({ persist: false })

var hyperId = createDidHyper(myNode)
// var peerId = createDidHyper(peerNode)
// handle shutdown gracefully
const closeHandler = async () => {
  console.log('Shutting down...')
  await myNode.close()
  process.exit()
}

process.on('SIGINT', closeHandler)
process.on('SIGTERM', closeHandler)
beforeEach(async () => {
  jest.clearAllMocks()
  mockEmptyInstance = createMockEmptyHypnsInstance()
})

afterAll(async () => {
  // await myNode.close()
  // await peerNode.close()
})
describe('All tests', () => {
  describe('factory', () => {
    it('should create hyperId with all specification methods', async () => {
      expect(typeof hyperId.resolve).toEqual('function')
      expect(typeof hyperId.create).toEqual('function')
      expect(typeof hyperId.update).toEqual('function')
      expect(typeof getDid).toEqual('function')
    })

    it('should not create hyperId if hypns is not ready', () => {
      expect.assertions(1)

      expect(
        async () =>
          await hyperId.create({
            ready: jest.fn(async () => {
              throw new Error('foo')
            })
          })
      ).rejects.toEqual(new UnavailableHypnsInstance())
    })

    it('should not create hyperId if hypns is not writeable', () => {
      expect(
        async () => await hyperId.create({ writeable: () => false })
      ).rejects.toEqual(new UnavailableHypnsInstance())
    })
  })

  describe('create', () => {
    it('should create successfully on empty instance', async () => {
      const operations = jest.fn()

      const document = await hyperId.create(mockEmptyInstance, operations)
      expect(document).toEqual(mockCreatedDocument)
      expect(operations).toHaveBeenCalledTimes(1)
      expect(operations.mock.calls[0][0].constructor.name).toEqual('Document')
    })

    it('create should fail if document already exists', async () => {
      const operations = jest.fn()
      await expect(hyperId.create({ latest: 'a did doc', writable: true }, operations)).rejects.toThrow(
        'Document already exists.'
      )

      expect(operations).toHaveBeenCalledTimes(0)
    })

    it('create should fail on an empty drive if a document operation fails', async () => {
      const operations = jest.fn(() => {
        throw new Error('Operation Failed')
      })

      await expect(
        hyperId.create(mockEmptyInstance, operations)
      ).rejects.toThrow('Operation Failed')

      expect(operations).toHaveBeenCalledTimes(1)
    })
  })
  describe('resolve', () => {
    it('should resolve successfully', async () => {
      const operations = jest.fn()
      const instance = await myNode.open()
      await hyperId.create(instance, operations)

      // const document = await hyperId.resolve(mockDid)

    // expect(document).toEqual(mockCreatedDocument)
    })
  })
})
// describe('update', () => {
//   it('should update successfully on non-empty drive', async () => {
//     const operations = jest.fn()
//     const hyperId = await createDidHyper()

//     hyperId.readFile = jest.fn(() => mockDocument)

//     const document = await hyperId.update(mockHyperDrive, operations)

//     expect(operations).toHaveBeenCalledTimes(1)
//     expect(operations.mock.calls[0][0].constructor.name).toEqual('Document')
//   })

//   it('update should fail if no document available', async () => {
//     const operations = jest.fn()
//     const hyperId = await createDidHyper()

//     hyperId.readFile = jest.fn(() => {
//       throw new Error('foo')
//     })

//     await expect(
//       hyperId.update(mockEmptyHyperdrive, operations)
//     ).rejects.toThrow('foo')
//   })
// })
