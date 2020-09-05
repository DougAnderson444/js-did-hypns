import createDocument, { assertDocument } from "./document";
import { parseDid } from "./utils";
import {
  UnavailableHyperdrive,
  InvalidDid,
  IllegalCreate,
} from "./utils/errors";
import { HYPER_DID_NAME, DID_DOC_FILENAME } from "./constants";

//import { once } from "events"; //need polyfill for browsers
import once from "events.once"; // polyfill for nodejs events.once in the browser

class HyperId {
  #drive;
  #Hyperdrive;

  constructor(drive, Hyperdrive) {
    this.#drive = drive;
    this.#Hyperdrive = Hyperdrive;
  }

  assertDrive = async () => {
    try {
      await this.#drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    if (!this.#drive.writable) throw new UnavailableHyperdrive();

    return await this.getDid();
  };

  create = async (operations) => {
    const did = await this.assertDrive();
    try {
      // try to read it to ensure it doesnt already exist
      await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
    } catch (error) {
      // if it fails to read, we are allowed to create it
      const document = createDocument(did);

      operations(document);

      return await this.publish(document.getContent());
    }

    // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate
    throw new IllegalCreate();
  };

  update = async (operations) => {
    const did = await this.assertDrive();
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
      throw new UnavailableHyperdrive();
    }
  };

  resolve = async (did) => {
    const { identifier } = parseDid(did);
    try {
      let content, contentString;

      if (did && identifier != this.#drive.key.toString("hex")) {
        // not self, get a copy
        const copy = this.#Hyperdrive(identifier);

        try {
          await copy.ready();
        } catch (error) {
          throw new UnavailableHyperdrive();
        }

        // Wait for the connection to be made
        if (!copy.peers.length) {
          await once(copy, "peer-open"); // TODO: add timeout?
        }

        await once(copy, "content-feed"); // wait for the content to be fed from the remote peer
        contentString = await copy.readFile(DID_DOC_FILENAME, "utf8");
      } else {
        // self
        contentString = await this.#drive.readFile(DID_DOC_FILENAME, "utf8");
      }

      content = JSON.parse(contentString);

      assertDocument(content);
      return content;
    } catch (err) {
      console.log("resolve Error: ", err);
      if (err.code === "INVALID_DOCUMENT") {
        throw err;
      }

      throw new InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
        originalError: err.message,
      });
    }
  };
  getDid = async () => {
    try {
      await this.#drive.ready();
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    return `did:hyper:${this.#drive.key.toString("hex")}`;
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

const createDidHyper = async (Hyperdrive) => {
  const drive = Hyperdrive(HYPER_DID_NAME);
  await drive.ready();
  if (!drive.writable) throw new UnavailableHyperdrive();

  return new HyperId(drive, Hyperdrive);
};

export default createDidHyper;
