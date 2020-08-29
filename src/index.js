import createDocument, { assertDocument } from "./document";
import { parseDid } from "./utils";
import {
  UnavailableHyperdrive,
  InvalidDid,
  IllegalCreate,
} from "./utils/errors";
import SDK from "dat-sdk";
import { once } from "events";
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

    const did = await getDid(this.#drive);

    try {
      // try to read it to ensure it doesnt already exist
      await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
    } catch (error) {
      // if it fails to read, we are allowed to create it
      const document = createDocument(did);

      operations(document);

      return await this.publish(document.getContent());
    }

    // if it reads successfully, we need to throw IllegalCreate
    throw new IllegalCreate();
  };

  update = async (operations) => {
    try {
      await this.#drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!this.#drive.writable) throw new UnavailableHyperdrive();

    const did = await getDid(this.#drive);
    const contentString = await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
    const content = JSON.parse(contentString);
    const document = createDocument(did, content);

    operations(document);

    return await this.publish(document.getContent());
  };

  publish = async (content) => {
    try {
      await this.#drive.writeFile(DID_DOC_FILENAME, JSON.stringify(content));
      return content;
    } catch (error) {
      console.log(error);
    }
  };

  resolve = async (did) => {
    const { identifier } = parseDid(did);
    let content;
    try {
      var { close, Hyperdrive } = await SDK({
        persist: false,
      });

      let contentString;

      if (did && identifier != this.#drive.key.toString("hex")) {
        // not self, get a copy
        const copy = Hyperdrive(identifier);

        try {
          await copy.ready();
        } catch (error) {
          throw new UnavailableHyperdrive();
        }

        // Wait for the connection to be made
        if (!copy.peers.length) {
          console.log("no peers yet, waiting for them...");
          await once(copy, "peer-open"); //timeout?
        }
        contentString = await copy.readFile(DID_DOC_FILENAME, "utf8");
      } else {
        // self
        contentString = await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
      }

      content = JSON.parse(contentString);

      assertDocument(content);
    } catch (err) {
      console.log("resolve Error: ", err);
      if (err.code === "INVALID_DOCUMENT") {
        throw err;
      }

      throw new InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
        originalError: err.message,
      });
    } finally {
      await close();
      return content;
    }
  };
}

export const getDid = async (drive) => {
  try {
    await drive.ready();
  } catch (error) {
    throw new UnavailableHyperdrive();
  }
  return `did:hyper:${drive.key.toString("hex")}`;
};

const createDidHyper = (drive) => {
  if (!drive.writable) throw new UnavailableHyperdrive();

  return new HyperId(drive);
};

export default createDidHyper;
