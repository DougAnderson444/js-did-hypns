"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertDocument = exports.generateDocument = exports.isEquivalentId = exports.createId = exports.SEPARATORS = void 0;

var _isPlainObject2 = _interopRequireDefault(require("lodash/isPlainObject"));

var _isString2 = _interopRequireDefault(require("lodash/isString"));

var _utils = require("../../utils");

var _errors = require("../../utils/errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_CONTEXT = "https://w3id.org/did/v1";
const SEPARATORS = {
  PUBLIC_KEY: "#",
  SERVICE: ";"
};
exports.SEPARATORS = SEPARATORS;

const createId = (did, fragment, separator, options) => {
  const {
    prefix = ""
  } = { ...options
  };

  if (typeof prefix !== "string" || Object.values(SEPARATORS).some(sep => prefix.includes(sep))) {
    throw new _errors.InvalidIdPrefix();
  }

  fragment = fragment || (0, _utils.generateRandomString)();
  return `${did}${separator}${prefix}${fragment}`;
};

exports.createId = createId;

const isEquivalentId = (id1, id2, separator) => {
  if (!(0, _isString2.default)(id1) || !(0, _isString2.default)(id2)) {
    return false;
  }

  id1 = id1.includes(separator) ? id1.split(separator)[1] : id1;
  id2 = id2.includes(separator) ? id2.split(separator)[1] : id2;
  return id1 === id2;
};

exports.isEquivalentId = isEquivalentId;

const generateDocument = did => ({
  "@context": DEFAULT_CONTEXT,
  id: did,
  created: new Date().toISOString()
});

exports.generateDocument = generateDocument;

const assertDocument = content => {
  if (!(0, _isPlainObject2.default)(content)) {
    throw new _errors.InvalidDocument("Document content must be a plain object.");
  }

  const {
    "@context": context,
    id
  } = content;

  if (!context) {
    throw new _errors.InvalidDocument('Document content must contain "@context" property.');
  } else if (Array.isArray(context)) {
    if (context[0] !== DEFAULT_CONTEXT) {
      throw new _errors.InvalidDocument(`First "@context" value must be: "${DEFAULT_CONTEXT}". Found: "${context[0]}"`);
    }
  } else if ((0, _isString2.default)(context)) {
    if (context !== DEFAULT_CONTEXT) {
      throw new _errors.InvalidDocument(`Document with only one "@context" value must be none other than: "${DEFAULT_CONTEXT}". Found: "${context}"`);
    }
  } else {
    throw new _errors.InvalidDocument('Document "@context" value must be a string or an ordered set.');
  }

  if (!id) {
    throw new _errors.InvalidDocument('Document content must contain "id" property.');
  } else if (!(0, _utils.isDidValid)(id)) {
    throw new _errors.InvalidDocument(`Document "id" must be a valid DID. Found: "${id}"`);
  }
};

exports.assertDocument = assertDocument;