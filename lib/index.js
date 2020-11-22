"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHyperDid = exports.getDid = void 0;

var _document = _interopRequireWildcard(require("./document"));

var _utils = require("./utils");

var _errors = require("./utils/errors");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import { once } from 'events' // need polyfill for browsers
// import once from 'events.once' // polyfill for nodejs events.once in the browser
const once = require('events.once'); // polyfill for nodejs events.once in the browser


class HyperDid {
  constructor(node) {
    _defineProperty(this, "create", async (hypnsInstance, operations) => {
      assertInstance(hypnsInstance);
      const did = getDid(hypnsInstance);

      if (!hypnsInstance.latest) {
        // if it fails to read, we are allowed to create it
        const document = (0, _document.default)(did);
        operations(document);
        return await this.publish(hypnsInstance, document.getContent());
      } // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate


      throw new _errors.IllegalCreate();
    });

    _defineProperty(this, "update", async (hypnsInstance, operations) => {
      try {
        assertInstance(hypnsInstance);
        const did = getDid(hypnsInstance);
        const content = hypnsInstance.latest.didDoc;
        const document = (0, _document.default)(did, content);
        operations(document);
        return await this.publish(hypnsInstance, document.getContent());
      } catch (error) {
        throw new _errors.UnavailableHypnsInstance();
      }
    });

    _defineProperty(this, "publish", async (hypnsInstance, content) => {
      try {
        await hypnsInstance.publish({
          didDoc: content,
          text: content
        });
        return content;
      } catch (error) {
        console.error(error);
        throw new _errors.UnavailableHypnsInstance();
      }
    });

    _defineProperty(this, "resolve", async did => {
      const {
        identifier: publicKey
      } = (0, _utils.parseDid)(did);

      try {
        var copy = await this.node.open({
          keypair: {
            publicKey
          },
          temp: true
        });
        copy.on('error', error => {
          console.error('\nCopy error in Hypns resolve\n', error); // JSON.stringify(error, null, 2)
        });
        process.nextTick(async () => {
          try {
            await copy.ready();
          } catch (error) {
            console.error('next Tick', error);
          }
        });

        try {
          await once(copy, 'update'); // wait for the content to be updated from the remote peer
        } catch (error) {
          console.error('await once error', error);
        }

        const content = copy.latest.didDoc;
        (0, _document.assertDocument)(content);
        return content;
      } catch (err) {
        console.log('resolve Error: ', err);

        if (err.code === 'INVALID_DOCUMENT') {
          throw err;
        }

        throw new _errors.InvalidDid(did, `Unable to resolve document with DID: ${did}`, {
          originalError: err.message
        });
      } finally {
        await copy.close();
      }
    });

    this.node = node;
  }

}

const assertInstance = hypnsInstance => {
  if (!hypnsInstance.writable || typeof hypnsInstance.publish !== 'function') throw new _errors.UnavailableHypnsInstance();
  return getDid(hypnsInstance);
};

const getDid = hypnsInstance => {
  return `did:hyper:${hypnsInstance.publicKey}`;
};

exports.getDid = getDid;

const createHyperDid = node => {
  return new HyperDid(node);
}; // export default hyperDid
// module.exports = hyperDid
// module.exports = { createHyperDid, getDid }


exports.createHyperDid = createHyperDid;