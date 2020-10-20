"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _errors = require("../utils/errors");

var SEPARATOR = _utils.SEPARATORS.PUBLIC_KEY;
var REQUIRED = ['id', 'type', 'controller'];
var ENCODINGS = ['publicKeyPem', 'publicKeyJwk', 'publicKeyHex', 'publicKeyBase64', 'publicKeyBase58', 'publicKeyMultibase'];

var assertId = (publicKey, publicKeys) => {
  var collision = publicKeys.some(key => (0, _utils.isEquivalentId)(key.id, publicKey.id, SEPARATOR));

  if (collision) {
    throw new _errors.DuplicatePublicKey(publicKey.id);
  }
};

var assertRequired = publicKey => {
  REQUIRED.forEach(key => {
    if (!publicKey[key]) {
      throw new _errors.InvalidPublicKey("PublicKey requires `".concat(key, "` to be defined."));
    }
  });
};

var assertEncodings = publicKey => {
  var encodings = Object.keys(publicKey).filter(key => key.includes('publicKey'));

  if (encodings.length !== 1) {
    throw new _errors.InvalidPublicKey('Property prefixed by `publicKey` is required and must be unique');
  }

  if (!ENCODINGS.includes(encodings[0])) {
    throw new _errors.InvalidPublicKey("Encoding `".concat(encodings[0], "` is invalid"));
  }
};

var assert = (publicKey, publicKeys) => {
  assertId(publicKey, publicKeys);
  assertRequired(publicKey);
  assertEncodings(publicKey);
};

var _default = {
  assert,
  separator: SEPARATOR,
  createId: (did, fragment, options) => (0, _utils.createId)(did, fragment, SEPARATOR, options)
};
exports.default = _default;
module.exports = exports.default;