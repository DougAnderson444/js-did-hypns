/* eslint-disable no-undef */
test.skip('skip', () => {})

export const mockPublicKey =
  'dee2fc9db57f409cfa5edea42aa40790f3c1b314e3630a04f25b75ad42b71835'
export const mockPrivateKey =
  '1e9813baf16eb415a61a56693b037d5aec294279b35a814aff239a0c61f71d3bdee2fc9db57f409cfa5edea42aa40790f3c1b314e3630a04f25b75ad42b71835'
const mockKeypair = {
  publicKey: mockPublicKey,
  secretKey: mockPrivateKey
}
export let mockFileName
export let mockFileWriteContent

export const mockDid = `did:hyper:${mockPublicKey}`

export const mockCreatedDocument = {
  '@context': 'https://w3id.org/did/v1',
  id: `${mockDid}`,
  created: '2019-03-18T15:55:38.636Z'
}

export const mockDocument = {
  '@context': 'https://w3id.org/did/v1',
  id: mockDid,
  created: '2019-03-19T16:52:44.948Z',
  updated: '2019-03-19T16:53:56.463Z',
  publicKey: [
    {
      id: `${mockDid}#bqvnazrkarh`,
      type: 'myType',
      controller: 'myController',
      publicKeyHex: '1A2B3C'
    }
  ],
  authentication: [`${mockDid}#bqvnazrkarh`],
  service: [
    {
      id: `${mockDid};myServiceId`,
      type: 'myServiceType',
      serviceEndpoint: 'http://myserviceendpoint.com'
    }
  ]
}

export const createMockHyperdrive = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    key: identifier || mockPublicKey,
    readFile: jest.fn(async () => mockDocument),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    })
  }
}

export const createMockEmptyHyperdrive = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    key: identifier || mockPublicKey,
    readFile: jest.fn(() => {
      throw new Error('foo')
    }),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    })
  }
}

export const createMockDriveInvalidDoc = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    key: identifier || mockPublicKey,
    readFile: jest.fn(async () => '123'),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    })
  }
}

export const createMockEmptyHypnsInstance = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    readFile: jest.fn(() => {
      throw new Error('foo')
    }),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    }),
    publish: jest.fn((content) => {
      mockFileWriteContent = content.didDoc
    }),
    latest: null,
    _keypair: mockKeypair,
    key: mockPublicKey,
    publicKey: mockPublicKey
  }
}
