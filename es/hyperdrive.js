"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getDid = void 0;

var _document = _interopRequireWildcard(require("./document"));

var _utils = require("./utils");

var _errors = require("./utils/errors");

var _constants = require("./constants");

var _events = _interopRequireDefault(require("events.once"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var _Hyperdrive = new WeakMap();

// polyfill for nodejs events.once in the browser
class HyperId {
  constructor(Hyperdrive) {
    _Hyperdrive.set(this, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "create", async (drive, operations) => {
      await assertDrive(drive);
      const did = await getDid(drive);

      try {
        // try to read it to ensure it doesnt already exist
        await drive.readFile(_constants.DID_DOC_FILENAME, "utf8");
      } catch (error) {
        // if it fails to read, we are allowed to create it
        const document = (0, _document.default)(did);
        operations(document);
        return await this.publish(drive, document.getContent());
      } // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate


      throw new _errors.IllegalCreate();
    });

    _defineProperty(this, "update", async (drive, operations) => {
      await assertDrive(drive);
      const did = await getDid(drive);
      let contentString;

      try {
        contentString = await drive.readFile(_constants.DID_DOC_FILENAME, "utf8");
      } catch (error) {
        throw new _errors.UnavailableHyperdrive();
      }

      const content = JSON.parse(contentString);
      const document = (0, _document.default)(did, content);
      operations(document);
      return await this.publish(drive, document.getContent());
    });

    _defineProperty(this, "publish", async (drive, content) => {
      try {
        await drive.writeFile(_constants.DID_DOC_FILENAME, JSON.stringify(content));
        return content;
      } catch (error) {
        console.log(error);
        throw new _errors.UnavailableHyperdrive();
      }
    });

    _defineProperty(this, "resolve", async did => {
      const {
        identifier
      } = (0, _utils.parseDid)(did);

      try {
        let content, contentString; // not self, get a copy of the drive

        const copy = _classPrivateFieldGet(this, _Hyperdrive).call(this, identifier);

        try {
          await copy.ready();
        } catch (error) {
          throw new _errors.UnavailableHyperdrive();
        } // Wait for the connection to be made


        if (!copy.writable && !copy.peers.length) {
          await (0, _events.default)(copy, "peer-open"); // TODO: add timeout?
        }

        if (!copy.writable) await (0, _events.default)(copy, "content-feed"); // wait for the content to be fed from the remote peer

        contentString = await copy.readFile(_constants.DID_DOC_FILENAME, "utf8");
        content = JSON.parse(contentString);
        (0, _document.assertDocument)(content);
        return content;
      } catch (err) {
        console.log("resolve Error: ", err);

        if (err.code === "INVALID_DOCUMENT") {
          throw err;
        }

        throw new _errors.InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
          originalError: err.message
        });
      }
    });

    _classPrivateFieldSet(this, _Hyperdrive, Hyperdrive);
  }

}

const assertDrive = async drive => {
  try {
    await drive.ready();
  } catch (error) {
    throw new _errors.UnavailableHyperdrive();
  }

  if (!drive.writable) throw new _errors.UnavailableHyperdrive();
  return await getDid(drive);
};

const getDid = async drive => {
  await drive.ready();
  return `did:hypns:${drive.key.toString("hex")}`;
};

exports.getDid = getDid;

const createDidHyper = Hyperdrive => {
  return new HyperId(Hyperdrive);
};

var _default = createDidHyper;
exports.default = _default;