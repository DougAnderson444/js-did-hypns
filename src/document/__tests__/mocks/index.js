test.skip('skip', () => {})

export const mockDid = 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD'

export const mockContent = {
  '@context': 'https://w3id.org/did/v1',
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
  created: '2019-03-18T15:55:38.636Z'
}

export const mockPublickKey1 = {
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD#PK1',
  controller: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
  type: 'myType',
  publicKeyHex: '1A2B3C'
}

export const mockPublickKey2 = {
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD#PK2',
  controller: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
  type: 'myType2',
  publicKeyHex: '4D5E6F'
}

export const mockService1 = {
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD;Service1',
  type: 'myServiceType',
  serviceEndpoint: 'http://service.foo.bar'
}

export const mockService2 = {
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD;Service2',
  type: 'myServiceType',
  serviceEndpoint: 'http://service.bar.foo'
}
