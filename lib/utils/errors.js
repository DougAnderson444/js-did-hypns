"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidIdPrefix = exports.InvalidDocument = exports.UnavailableHypnsInstance = exports.UnavailableHyperdrive = exports.IllegalCreate = exports.InvalidDid = exports.InvalidService = exports.DuplicateService = exports.InvalidPublicKey = exports.DuplicatePublicKey = exports.InvalidAuthentication = exports.DuplicateAuthentication = exports.BaseError = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BaseError extends Error {
  constructor(message, code, props) {
    super(message);
    Object.assign(this, _objectSpread(_objectSpread({}, props), {}, {
      code,
      name: this.constructor.name
    }));

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
      return;
    }

    this.stack = new Error(message).stack;
  }

} // Authentication Based -------------------------------------


exports.BaseError = BaseError;

class DuplicateAuthentication extends BaseError {
  constructor(id) {
    super("Authentication with same ".concat(id, " already exists."), 'DUPLICATE_AUTHENTICATION');
  }

}

exports.DuplicateAuthentication = DuplicateAuthentication;

class InvalidAuthentication extends BaseError {
  constructor(message) {
    message = message || 'Invalid authentication.';
    super(message, 'INVALID_AUTHENTICATION');
  }

} // ----------------------------------------------------------
// Public Key Based -----------------------------------------


exports.InvalidAuthentication = InvalidAuthentication;

class DuplicatePublicKey extends BaseError {
  constructor(id) {
    super("PublicKey with same ".concat(id, " already exists."), 'DUPLICATE_PUBLICKEY');
  }

}

exports.DuplicatePublicKey = DuplicatePublicKey;

class InvalidPublicKey extends BaseError {
  constructor(message) {
    message = message || 'Invalid public key.';
    super(message, 'INVALID_PUBLICKEY');
  }

} // ----------------------------------------------------------
// Service Endpoint Based -----------------------------------


exports.InvalidPublicKey = InvalidPublicKey;

class DuplicateService extends BaseError {
  constructor(id) {
    super("Service with same ".concat(id, " already exists."), 'DUPLICATE_SERVICE');
  }

}

exports.DuplicateService = DuplicateService;

class InvalidService extends BaseError {
  constructor(message) {
    message = message || 'Invalid service.';
    super(message, 'INVALID_SERVICE');
  }

} // ----------------------------------------------------------
// IPFS/IPNS Based ------------------------------------------


exports.InvalidService = InvalidService;

class InvalidDid extends BaseError {
  constructor(did, message, props) {
    message = message || "Invalid DID: ".concat(did);
    super(message, 'INVALID_DID', props);
  }

}

exports.InvalidDid = InvalidDid;

class IllegalCreate extends BaseError {
  constructor(message) {
    message = message || 'Document already exists.';
    super(message, 'ILLEGAL_CREATE');
  }

}

exports.IllegalCreate = IllegalCreate;

class UnavailableHyperdrive extends BaseError {
  constructor(message) {
    message = message || 'Hyperdrive is unavailable.';
    super(message, 'HYPERDRIVE_UNAVAILABLE');
  }

}

exports.UnavailableHyperdrive = UnavailableHyperdrive;

class UnavailableHypnsInstance extends BaseError {
  constructor(message) {
    message = message || 'Hypns Instance is unavailable.';
    super(message, 'HYPNSINSTANCE_UNAVAILABLE');
  }

} // ----------------------------------------------------------
// Document Based -----------------------------------


exports.UnavailableHypnsInstance = UnavailableHypnsInstance;

class InvalidDocument extends BaseError {
  constructor(message) {
    message = message || 'Document is invalid.';
    super(message, 'INVALID_DOCUMENT');
  }

}

exports.InvalidDocument = InvalidDocument;

class InvalidIdPrefix extends BaseError {
  constructor() {
    super('Id prefix should be a string without reserved characters: ["#", ";"]', 'INVALID_ID_PREFIX');
  }

} // ----------------------------------------------------------


exports.InvalidIdPrefix = InvalidIdPrefix;