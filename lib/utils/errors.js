"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidIdPrefix = exports.InvalidDocument = exports.UnavailableHyperdrive = exports.IllegalCreate = exports.InvalidDid = exports.InvalidService = exports.DuplicateService = exports.InvalidPublicKey = exports.DuplicatePublicKey = exports.InvalidAuthentication = exports.DuplicateAuthentication = exports.BaseError = void 0;

class BaseError extends Error {
  constructor(message, code, props) {
    super(message);
    Object.assign(this, { ...props,
      code,
      name: this.constructor.name
    });

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
    super(`Authentication with same ${id} already exists.`, 'DUPLICATE_AUTHENTICATION');
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
    super(`PublicKey with same ${id} already exists.`, 'DUPLICATE_PUBLICKEY');
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
    super(`Service with same ${id} already exists.`, 'DUPLICATE_SERVICE');
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
    message = message || `Invalid DID: ${did}`;
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

} // ----------------------------------------------------------
// Document Based -----------------------------------


exports.UnavailableHyperdrive = UnavailableHyperdrive;

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