import createDocument, { assertDocument } from "./document";
import { parseDid } from "./utils";
import {
  UnavailableHyperdrive,
  InvalidDid,
  IllegalCreate,
} from "./utils/errors";

import { DID_DOC_FILENAME } from "./constants";

class HyperId {
  #drive;
  constructor(drive) {
    this.#drive = drive;
  }

  create = async (operations) => {
    try {
      await this.#drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!this.#drive.writable) throw new UnavailableHyperdrive();

    const did = await getDid(drive);

    try {
      // try to read it to ensure it doesnt already exist
      await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
    } catch (error) {
      // if it fails to read, we are allowed to create it
      const document = createDocument(did);

      operations(document);

      return await this.publish(drive, document.getContent());
    }

    // if it reads successfully, we need to throw IllegalCreate
    throw new IllegalCreate();
  };

  update = async (drive, operations) => {
    try {
      await this.#drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!this.#drive.writable) throw new UnavailableHyperdrive();

    const did = await getDid(drive);
    const content = await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
    const document = createDocument(did, content);

    operations(document);

    return await this.publish(document.getContent(), drive);
  };

  publish = async (content, drive) => {
    try {
      await this.#drive.writeFile(DID_DOC_FILENAME, content);
      return content;
    } catch (error) {
      //console.log(error);
    }
  };
}

export const resolve = async (did) => {
  const { identifier } = parseDid(did);

  try {
    var { Hyperdrive, close } = await SDK({
      persist: false,
    });

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

export const getDid = async (drive) => {
  try {
    await drive.ready();
  } catch (error) {
    throw new UnavailableHyperdrive();
  }
  return `did:hyper:${drive.key}`;
};

const createDidHyper = (drive) => {
  return new HyperId(drive);
};

export default createDidHyper;
