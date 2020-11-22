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
  #Hyperdrive;

  constructor(Hyperdrive) {
    this.#Hyperdrive = Hyperdrive;
  }

  create = async (drive, operations) => {
    await assertDrive(drive);
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

    // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate
    throw new IllegalCreate();
  };

  update = async (drive, operations) => {
    await assertDrive(drive);
    const did = await getDid(drive);

    let contentString;
    try {
      contentString = await drive.readFile(DID_DOC_FILENAME, "utf8");
    } catch (error) {
      throw new UnavailableHyperdrive();
    }
    const content = JSON.parse(contentString);
    const document = createDocument(did, content);

    operations(document);

    return await this.publish(drive, document.getContent());
  };

  publish = async (drive, content) => {
    try {
      await drive.writeFile(DID_DOC_FILENAME, JSON.stringify(content));
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

      // not self, get a copy of the drive
      const copy = this.#Hyperdrive(identifier);

      try {
        await copy.ready();
      } catch (error) {
        throw new UnavailableHyperdrive();
      }

      // Wait for the connection to be made
      if (!copy.writable && !copy.peers.length ) {
        await once(copy, "peer-open"); // TODO: add timeout?
      }

      if (!copy.writable) await once(copy, "content-feed"); // wait for the content to be fed from the remote peer
      contentString = await copy.readFile(DID_DOC_FILENAME, "utf8");

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
}

const assertDrive = async (drive) => {
  try {
    await drive.ready();
  } catch (error) {
    throw new UnavailableHyperdrive();
  }
  if (!drive.writable) throw new UnavailableHyperdrive();

  return await getDid(drive);
};

export const getDid = async (drive) => {
  await drive.ready();
  return `did:hypns:${drive.key.toString("hex")}`;
};

const createDidHyper = (Hyperdrive) => {
  return new HyperId(Hyperdrive);
};

export default createDidHyper;
