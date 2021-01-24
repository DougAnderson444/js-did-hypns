"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

var _errors = require("../utils/errors");

const parseId = authentication => (0, _lodash.isPlainObject)(authentication) ? authentication.id : authentication;

const assertId = (id, authentications) => {
  const collision = authentications.some(auth => parseId(auth) === id);

  if (collision) {
    throw new _errors.DuplicateAuthentication(id);
  }
};

const assertType = authentication => {
  if (!(0, _lodash.isString)(authentication)) {
    throw new _errors.InvalidAuthentication();
  }
};

const assert = (authentication, authentications) => {
  assertType(authentication);
  assertId(parseId(authentication), authentications);
};

var _default = {
  assert,
  parseId
};
exports.default = _default;