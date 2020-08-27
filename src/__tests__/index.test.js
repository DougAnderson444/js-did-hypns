import createDidHyper from "../index";
import {
  createMockHyperdrive,
  createMockEmptyHyperdrive,
  createMockDriveInvalidDoc,
  mockDid,
  mockDocument,
} from "./mocks";
import { conflicts } from "yargs";
import {
  UnavailableHyperdrive,
  InvalidDid,
  InvalidDocument,
} from "../utils/errors";
import { DID_DOC_FILENAME } from "../constants";

global.Date = class Date {
  constructor() {
    this.toISOString = () => "2019-03-18T15:55:38.636Z";
  }
};

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  generateRandomString: jest.fn(() => "randomString"),
}));

let mockHyperDrive,
  mockDriveFactory,
  mockDriveClose,
  mockEmptyHyperdrive,
  mockDriveInvalidDoc;

beforeEach(async () => {
  jest.clearAllMocks();
  mockHyperDrive = createMockHyperdrive();
  mockEmptyHyperdrive = createMockEmptyHyperdrive();
  mockDriveFactory = jest.fn((id) => createMockHyperdrive(id));
  mockDriveClose = jest.fn(async () => {
    return { call: new Promise((resolve, reject) => resolve()) };
    //return new Promise((resolve, reject) => resolve());
  });
  mockDriveInvalidDoc = jest.fn((id) => createMockDriveInvalidDoc());
});

describe("factory", () => {
  it("should create hyperId with all specification methods", async () => {
    const hyperId = createDidHyper();

    expect(typeof hyperId.resolve).toEqual("function");
    expect(typeof hyperId.create).toEqual("function");
    expect(typeof hyperId.update).toEqual("function");
  });

  it("should not create hyperId if hyderdrive is not ready", () => {
    expect.assertions(1);
    const hyperId = createDidHyper();

    expect(
      async () =>
        await hyperId.create({
          ready: jest.fn(async () => {
            throw new Error("foo");
          }),
        })
    ).rejects.toEqual(new UnavailableHyperdrive());
  });

  it("should not create hyperId if hyderdrive is not writeable", () => {
    const hyperId = createDidHyper();
    expect(
      async () => await hyperId.create({ writeable: () => false })
    ).rejects.toEqual(new UnavailableHyperdrive());
  });
});

describe("resolve", () => {
  it("should resolve successfully", async () => {
    const hyperId = createDidHyper();

    const document = await hyperId.resolve(
      mockDid,
      mockDriveFactory,
      mockDriveClose
    );

    expect(document).toEqual(mockDocument);
  });

  it("resolve should fail if no hyperdrive file found", async () => {
    const hyperId = createDidHyper();

    await expect(
      hyperId.resolve(
        mockDid,
        jest.fn((id) => {
          return {
            readFile: jest.fn(async () => {
              throw new Error("foo");
            }),
          };
        }),
        mockDriveClose
      )
    ).rejects.toThrow(`Unable to resolve document with DID: ${mockDid}`);
  });

  it("should fail if document content is invalid", async () => {
    const hyperId = createDidHyper();
    /*
    jest.fn((id) => {
        return {
        ready: jest.fn(async () => {
            return { call: new Promise((resolve, reject) => resolve()) };
            }), 
        readFile: jest.fn(async () => ({ content: "123" })),
        };
    }),
    */
    await expect(
      hyperId.resolve(mockDid, mockDriveInvalidDoc, mockDriveClose)
    ).rejects.toThrow("Document content must be a plain object.");
  });
});

describe("create", () => {
  it("should create successfully on empty drive", async () => {
    const operations = jest.fn();
    const hyperId = createDidHyper();

    const document = await hyperId.create(mockEmptyHyperdrive, operations);

    expect(operations).toHaveBeenCalledTimes(1);
    expect(operations.mock.calls[0][0].constructor.name).toEqual("Document");

  });

  it("create should fail if document already exists", async () => {
    const operations = jest.fn();
    const hyperId = await createDidHyper();

    await expect(hyperId.create(mockHyperDrive, operations)).rejects.toThrow(
      "Document already exists."
    );

    expect(operations).toHaveBeenCalledTimes(0);
  });

  it("create should fail on an empty drive if a document operation fails", async () => {
    const operations = jest.fn(() => {
      throw new Error("Operation Failed");
    });
    const hyperId = await createDidHyper();

    await expect(
      hyperId.create(mockEmptyHyperdrive, operations)
    ).rejects.toThrow("Operation Failed");

    expect(operations).toHaveBeenCalledTimes(1);
  });
});

describe("update", () => {
  it("should update successfully on non-empty drive", async () => {
    const operations = jest.fn();
    const hyperId = await createDidHyper();

    hyperId.readFile = jest.fn(() => mockDocument);

    const document = await hyperId.update(operations, mockHyperDrive);

    expect(operations).toHaveBeenCalledTimes(1);
    expect(operations.mock.calls[0][0].constructor.name).toEqual("Document");
  });

  it("update should fail if no document available", async () => {
    const operations = jest.fn();
    const hyperId = await createDidHyper();

    hyperId.readFile = jest.fn(() => {
      throw new Error("foo");
    });

    await expect(
      hyperId.update(operations, mockEmptyHyperdrive)
    ).rejects.toThrow("foo");
  });
});
