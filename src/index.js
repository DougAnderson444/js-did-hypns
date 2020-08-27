import createDocument, { assertDocument } from "./document";
import { parseDid } from "./utils";
import {
  UnavailableHyperdrive,
  InvalidDid,
  IllegalCreate,
} from "./utils/errors";

import { DID_DOC_FILENAME } from "./constants";

class HyperId {
  constructor() {}

  async create(drive, operations) {
    try {
      await drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!drive.writable) throw new UnavailableHyperdrive();

    const did = await getDid(drive);

    try {
      // try to read it to ensure it doesnt already exist
      await drive.readFile(DID_DOC_FILENAME, "utf8");
    } catch (error) {
      // if it fails to read, we are allowed to create it
      const document = createDocument(did);

      operations(document);

      return await this.publish(drive, document.getContent());
    }

    // if it reads successfully, we need to throw IllegalCreate
    throw new IllegalCreate();
  }

  resolve = async (did, Hyperdrive, close) => {
    const { identifier } = parseDid(did);

    try {
      const copy = Hyperdrive(identifier);

      try {
        await copy.ready();
      } catch (error) {
        throw new UnavailableHyperdrive();
      }

      // Wait for the connection to be made
      if (!copy.peers.length) {
        await once(copy, "peer-open");
      }

      const content = await copy.readFile(DID_DOC_FILENAME, "utf8");

      assertDocument(content);

      return content;
    } catch (err) {
      //console.log("resolve err:", err);
      if (err.code === "INVALID_DOCUMENT") {
        throw err;
      }

      throw new InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
        originalError: err.message,
      });
    } finally {
      // Make sure to always close the SDK when you're done
      // This will remove entries from the p2p network
      // Which is important for speeding up peer discovery
      await close();
    }
  };

  async update(operations, drive) {
    try {
      await drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!drive.writable) throw new UnavailableHyperdrive();

    const did = await getDid(drive);
    const content = await drive.readFile(DID_DOC_FILENAME, "utf8");
    const document = createDocument(did, content);

    operations(document);

    return await this.publish(document.getContent(), drive);
  }

  publish = async (content, drive) => {
    try {
      await drive.writeFile(DID_DOC_FILENAME, content);
    } catch (error) {
      //console.log(error);
    }
  };
}

export const getDid = async (drive) => {
  try {
    await drive.ready();
  } catch (error) {
    throw new UnavailableHyperdrive();
  }
  return `did:hyper:${drive.key}`;
};

const createDidHyper = () => {
  return new HyperId();
};

export default createDidHyper;
