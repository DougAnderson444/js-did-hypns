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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFAULT_CONTEXT = 'https://w3id.org/did/v1';
var SEPARATORS = {
  PUBLIC_KEY: '#',
  SERVICE: ';'
};
exports.SEPARATORS = SEPARATORS;

var createId = (did, fragment, separator, options) => {
  var {
    prefix = ''
  } = _objectSpread({}, options);

  if (typeof prefix !== 'string' || Object.values(SEPARATORS).some(sep => prefix.includes(sep))) {
    throw new _errors.InvalidIdPrefix();
  }

  fragment = fragment || (0, _utils.generateRandomString)();
  return "".concat(did).concat(separator).concat(prefix).concat(fragment);
};

exports.createId = createId;

var isEquivalentId = (id1, id2, separator) => {
  if (!(0, _isString2.default)(id1) || !(0, _isString2.default)(id2)) {
    return false;
  }

  id1 = id1.includes(separator) ? id1.split(separator)[1] : id1;
  id2 = id2.includes(separator) ? id2.split(separator)[1] : id2;
  return id1 === id2;
};

exports.isEquivalentId = isEquivalentId;

var generateDocument = did => ({
  '@context': DEFAULT_CONTEXT,
  id: did,
  created: new Date().toISOString()
});

exports.generateDocument = generateDocument;

var assertDocument = content => {
  if (!(0, _isPlainObject2.default)(content)) {
    throw new _errors.InvalidDocument('Document content must be a plain object.');
  }

  var {
    '@context': context,
    id
  } = content;

  if (!context) {
    throw new _errors.InvalidDocument('Document content must contain "@context" property.');
  } else if (Array.isArray(context)) {
    if (context[0] !== DEFAULT_CONTEXT) {
      throw new _errors.InvalidDocument("First \"@context\" value must be: \"".concat(DEFAULT_CONTEXT, "\". Found: \"").concat(context[0], "\""));
    }
  } else if ((0, _isString2.default)(context)) {
    if (context !== DEFAULT_CONTEXT) {
      throw new _errors.InvalidDocument("Document with only one \"@context\" value must be none other than: \"".concat(DEFAULT_CONTEXT, "\". Found: \"").concat(context, "\""));
    }
  } else {
    throw new _errors.InvalidDocument('Document "@context" value must be a string or an ordered set.');
  }

  if (!id) {
    throw new _errors.InvalidDocument('Document content must contain "id" property.');
  } else if (!(0, _utils.isDidValid)(id)) {
    throw new _errors.InvalidDocument("Document \"id\" must be a valid DID. Found: \"".concat(id, "\""));
  }
};

exports.assertDocument = assertDocument;