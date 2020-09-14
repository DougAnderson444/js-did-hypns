"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _errors = require("../utils/errors");

const SEPARATOR = _utils.SEPARATORS.SERVICE;
const REQUIRED = ['type', 'serviceEndpoint'];

const assertId = (service, services) => {
  const collision = services.find(key => (0, _utils.isEquivalentId)(key.id, service.id, SEPARATOR));

  if (collision) {
    throw new _errors.DuplicateService(service.id);
  }
};

const assertRequired = publicKey => {
  REQUIRED.forEach(key => {
    if (!publicKey[key]) {
      throw new _errors.InvalidService(`Service requires \`${key}\` to be defined.`);
    }
  });
};

const assert = (service, services) => {
  assertId(service, services);
  assertRequired(service);
};

var _default = {
  assert,
  separator: SEPARATOR,
  createId: (did, fragment, options) => (0, _utils.createId)(did, fragment, SEPARATOR, options)
};
exports.default = _default;
module.exports = exports.default;