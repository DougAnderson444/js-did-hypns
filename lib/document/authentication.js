"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isPlainObject2 = _interopRequireDefault(require("lodash/isPlainObject"));

var _isString2 = _interopRequireDefault(require("lodash/isString"));

var _errors = require("../utils/errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseId = authentication => (0, _isPlainObject2.default)(authentication) ? authentication.id : authentication;

var assertId = (id, authentications) => {
  var collision = authentications.some(auth => parseId(auth) === id);

  if (collision) {
    throw new _errors.DuplicateAuthentication(id);
  }
};

var assertType = authentication => {
  if (!(0, _isString2.default)(authentication)) {
    throw new _errors.InvalidAuthentication();
  }
};

var assert = (authentication, authentications) => {
  assertType(authentication);
  assertId(parseId(authentication), authentications);
};

var _default = {
  assert,
  parseId
};
exports.default = _default;
module.exports = exports.default;