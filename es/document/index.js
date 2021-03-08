"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "assertDocument", {
  enumerable: true,
  get: function () {
    return _utils.assertDocument;
  }
});
exports.default = void 0;

var _lodash = require("lodash");

var _service = _interopRequireDefault(require("./service"));

var _publicKey = _interopRequireDefault(require("./publicKey"));

var _authentication = _interopRequireDefault(require("./authentication"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var _content = new WeakMap();

var _refreshUpdated = new WeakMap();

class Document {
  constructor(content) {
    _content.set(this, {
      writable: true,
      value: void 0
    });

    _refreshUpdated.set(this, {
      writable: true,
      value: () => {
        _classPrivateFieldGet(this, _content).updated = new Date().toISOString();
      }
    });

    // https://w3c.github.io/did-core/#did-document-properties
    _classPrivateFieldSet(this, _content, {
      publicKey: [],
      // This property has been deprecated in favor or verificationMethod
      authentication: [],
      service: [],
      //	An ordered set of Service Endpoint maps (see Section § 5.1.3 Service properties).
      alsoKnownAs: [],
      // An ordered set of strings that conform to the rules of [RFC3986] for URIs.
      controller: [],
      // A string or an ordered set of strings that conform to the rules in Section § 3.1 DID Syntax.
      verificationMethod: [],
      // An ordered set of Verification Method maps (see Section § 5.1.2 Verification Method properties).
      authentication: [],
      // An ordered set of either Verification Method maps (see Section § 5.1.2 Verification Method properties) or strings that conform to the rules in Section § 3.2 DID URL Syntax.
      assertionMethod: [],
      //
      keyAgreement: [],
      //
      capabilityInvocation: [],
      //
      capabilityDelegation: [],
      //
      ...content
    });
  }

  getContent() {
    return (0, _lodash.omitBy)(_classPrivateFieldGet(this, _content), prop => (0, _lodash.isUndefined)(prop) || (0, _lodash.isArray)(prop) && prop.length === 0);
  }

  addPublicKey(props, options) {
    const {
      idPrefix
    } = { ...options
    };
    props.id = _publicKey.default.createId(_classPrivateFieldGet(this, _content).id, props.id, {
      prefix: idPrefix
    });
    props.controller = props.controller || _classPrivateFieldGet(this, _content).id;

    _publicKey.default.assert(props, _classPrivateFieldGet(this, _content).publicKey);

    _classPrivateFieldGet(this, _content).publicKey.push(props);

    _classPrivateFieldGet(this, _refreshUpdated).call(this);

    return props;
  }

  revokePublicKey(id) {
    const filter = _classPrivateFieldGet(this, _content).publicKey.filter(key => !(0, _utils.isEquivalentId)(key.id, id, _publicKey.default.separator));

    if (_classPrivateFieldGet(this, _content).publicKey.length === filter.length) {
      return;
    }

    this.removeAuthentication(id);
    _classPrivateFieldGet(this, _content).publicKey = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

  addAuthentication(auth) {
    const key = _classPrivateFieldGet(this, _content).publicKey.find(pk => (0, _utils.isEquivalentId)(pk.id, auth, _publicKey.default.separator)) || {};

    _authentication.default.assert(key.id, _classPrivateFieldGet(this, _content).authentication);

    _classPrivateFieldGet(this, _content).authentication.push(key.id);

    _classPrivateFieldGet(this, _refreshUpdated).call(this);

    return key.id;
  }

  removeAuthentication(id) {
    const filter = _classPrivateFieldGet(this, _content).authentication.filter(auth => !(0, _utils.isEquivalentId)(id, _authentication.default.parseId(auth), _publicKey.default.separator));

    if (_classPrivateFieldGet(this, _content).authentication.length === filter.length) {
      return;
    }

    _classPrivateFieldGet(this, _content).authentication = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

  addService(props, options) {
    const {
      idPrefix
    } = { ...options
    };
    props.id = _service.default.createId(_classPrivateFieldGet(this, _content).id, props.id, {
      prefix: idPrefix
    });

    _service.default.assert(props, _classPrivateFieldGet(this, _content).service);

    _classPrivateFieldGet(this, _content).service.push(props);

    _classPrivateFieldGet(this, _refreshUpdated).call(this);

    return props;
  }

  removeService(id) {
    const filter = _classPrivateFieldGet(this, _content).service.filter(srvc => !(0, _utils.isEquivalentId)(srvc.id, id, _service.default.separator));

    if (_classPrivateFieldGet(this, _content).service.length === filter.length) {
      return;
    }

    _classPrivateFieldGet(this, _content).service = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

}

const createDocument = (did, content) => {
  if (!content) {
    content = (0, _utils.generateDocument)(did);
  }

  return new Document(content);
};

var _default = createDocument;
exports.default = _default;