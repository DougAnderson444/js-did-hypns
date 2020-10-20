"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "assertDocument", {
  enumerable: true,
  get: function get() {
    return _utils.assertDocument;
  }
});
exports.default = void 0;

var _isUndefined2 = _interopRequireDefault(require("lodash/isUndefined"));

var _isArray2 = _interopRequireDefault(require("lodash/isArray"));

var _omitBy2 = _interopRequireDefault(require("lodash/omitBy"));

var _service = _interopRequireDefault(require("./service"));

var _publicKey = _interopRequireDefault(require("./publicKey"));

var _authentication = _interopRequireDefault(require("./authentication"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    _classPrivateFieldSet(this, _content, _objectSpread({
      publicKey: [],
      authentication: [],
      service: []
    }, content));
  }

  getContent() {
    return (0, _omitBy2.default)(_classPrivateFieldGet(this, _content), prop => (0, _isUndefined2.default)(prop) || (0, _isArray2.default)(prop) && prop.length === 0);
  }

  addPublicKey(props, options) {
    var {
      idPrefix
    } = _objectSpread({}, options);

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
    var filter = _classPrivateFieldGet(this, _content).publicKey.filter(key => !(0, _utils.isEquivalentId)(key.id, id, _publicKey.default.separator));

    if (_classPrivateFieldGet(this, _content).publicKey.length === filter.length) {
      return;
    }

    this.removeAuthentication(id);
    _classPrivateFieldGet(this, _content).publicKey = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

  addAuthentication(auth) {
    var key = _classPrivateFieldGet(this, _content).publicKey.find(pk => (0, _utils.isEquivalentId)(pk.id, auth, _publicKey.default.separator)) || {};

    _authentication.default.assert(key.id, _classPrivateFieldGet(this, _content).authentication);

    _classPrivateFieldGet(this, _content).authentication.push(key.id);

    _classPrivateFieldGet(this, _refreshUpdated).call(this);

    return key.id;
  }

  removeAuthentication(id) {
    var filter = _classPrivateFieldGet(this, _content).authentication.filter(auth => !(0, _utils.isEquivalentId)(id, _authentication.default.parseId(auth), _publicKey.default.separator));

    if (_classPrivateFieldGet(this, _content).authentication.length === filter.length) {
      return;
    }

    _classPrivateFieldGet(this, _content).authentication = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

  addService(props, options) {
    var {
      idPrefix
    } = _objectSpread({}, options);

    props.id = _service.default.createId(_classPrivateFieldGet(this, _content).id, props.id, {
      prefix: idPrefix
    });

    _service.default.assert(props, _classPrivateFieldGet(this, _content).service);

    _classPrivateFieldGet(this, _content).service.push(props);

    _classPrivateFieldGet(this, _refreshUpdated).call(this);

    return props;
  }

  removeService(id) {
    var filter = _classPrivateFieldGet(this, _content).service.filter(srvc => !(0, _utils.isEquivalentId)(srvc.id, id, _service.default.separator));

    if (_classPrivateFieldGet(this, _content).service.length === filter.length) {
      return;
    }

    _classPrivateFieldGet(this, _content).service = filter;

    _classPrivateFieldGet(this, _refreshUpdated).call(this);
  }

}

var createDocument = (did, content) => {
  if (!content) {
    content = (0, _utils.generateDocument)(did);
  }

  return new Document(content);
};

var _default = createDocument;
exports.default = _default;