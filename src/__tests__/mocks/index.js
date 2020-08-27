test.skip("skip", () => {});

export const mockKey =
  "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD";

export let mockFileName;
export let mockFileWriteContent;

export const mockDid = `did:hyper:${mockKey}`;

export const mockDocument = {
  "@context": "https://w3id.org/did/v1",
  id: mockDid,
  created: "2019-03-19T16:52:44.948Z",
  updated: "2019-03-19T16:53:56.463Z",
  publicKey: [
    {
      id: `${mockDid}#bqvnazrkarh`,
      type: "myType",
      controller: "myController",
      publicKeyHex: "1A2B3C",
    },
  ],
  authentication: [`${mockDid}#bqvnazrkarh`],
  service: [
    {
      id: `${mockDid};myServiceId`,
      type: "myServiceType",
      serviceEndpoint: "http://myserviceendpoint.com",
    },
  ],
};

export const createMockHyperdrive = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) };
    }),
    writable: true,
    peers: ["mockPeer1", "mockPeer2"],
    key: identifier || mockKey,
    readFile: jest.fn(async () => mockDocument),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName;
      mockFileWriteContent = content;
    }),
  };
};

export const createMockEmptyHyperdrive = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) };
    }),
    writable: true,
    peers: ["mockPeer1", "mockPeer2"],
    key: identifier || mockKey,
    readFile: jest.fn(() => {
      throw new Error("foo");
    }),
    writeFile: jest.fn(async (fileName, content) => {
        mockFileName = fileName;
        mockFileWriteContent = content;
      }),
  };
};

export const createMockDriveInvalidDoc = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) };
    }),
    writable: true,
    peers: ["mockPeer1", "mockPeer2"],
    key: identifier || mockKey,
    readFile: jest.fn(async () => "123"),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName;
      mockFileWriteContent = content;
    }),
  };
};
