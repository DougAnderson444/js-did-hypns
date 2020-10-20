"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getDid = void 0;

var _document = _interopRequireWildcard(require("./document"));

var _utils = require("./utils");

var _errors = require("./utils/errors");

var _constants = require("./constants");

var _events = _interopRequireDefault(require("events.once"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var _Hyperdrive = new WeakMap();

// polyfill for nodejs events.once in the browser
class HyperId {
  constructor(Hyperdrive) {
    var _this = this;

    _Hyperdrive.set(this, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (drive, operations) {
        yield assertDrive(drive);
        var did = yield getDid(drive);

        try {
          // try to read it to ensure it doesnt already exist
          yield drive.readFile(_constants.DID_DOC_FILENAME, "utf8");
        } catch (error) {
          // if it fails to read, we are allowed to create it
          var document = (0, _document.default)(did);
          operations(document);
          return yield _this.publish(drive, document.getContent());
        } // if it reads successfully, DID Doc exists already, we need to throw IllegalCreate


        throw new _errors.IllegalCreate();
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "update", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (drive, operations) {
        yield assertDrive(drive);
        var did = yield getDid(drive);
        var contentString;

        try {
          contentString = yield drive.readFile(_constants.DID_DOC_FILENAME, "utf8");
        } catch (error) {
          throw new _errors.UnavailableHyperdrive();
        }

        var content = JSON.parse(contentString);
        var document = (0, _document.default)(did, content);
        operations(document);
        return yield _this.publish(drive, document.getContent());
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "publish", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (drive, content) {
        try {
          yield drive.writeFile(_constants.DID_DOC_FILENAME, JSON.stringify(content));
          return content;
        } catch (error) {
          console.log(error);
          throw new _errors.UnavailableHyperdrive();
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "resolve", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (did) {
        var {
          identifier
        } = (0, _utils.parseDid)(did);

        try {
          var content, contentString; // not self, get a copy of the drive

          var copy = _classPrivateFieldGet(_this, _Hyperdrive).call(_this, identifier);

          try {
            yield copy.ready();
          } catch (error) {
            throw new _errors.UnavailableHyperdrive();
          } // Wait for the connection to be made


          if (!copy.writable && !copy.peers.length) {
            yield (0, _events.default)(copy, "peer-open"); // TODO: add timeout?
          }

          if (!copy.writable) yield (0, _events.default)(copy, "content-feed"); // wait for the content to be fed from the remote peer

          contentString = yield copy.readFile(_constants.DID_DOC_FILENAME, "utf8");
          content = JSON.parse(contentString);
          (0, _document.assertDocument)(content);
          return content;
        } catch (err) {
          console.log("resolve Error: ", err);

          if (err.code === "INVALID_DOCUMENT") {
            throw err;
          }

          throw new _errors.InvalidDid(did, "Unable to resolve document with DID: ".concat(did), {
            originalError: err.message
          });
        }
      });

      return function (_x7) {
        return _ref4.apply(this, arguments);
      };
    }());

    _classPrivateFieldSet(this, _Hyperdrive, Hyperdrive);
  }

}

var assertDrive = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (drive) {
    try {
      yield drive.ready();
    } catch (error) {
      throw new _errors.UnavailableHyperdrive();
    }

    if (!drive.writable) throw new _errors.UnavailableHyperdrive();
    return yield getDid(drive);
  });

  return function assertDrive(_x8) {
    return _ref5.apply(this, arguments);
  };
}();

var getDid = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (drive) {
    yield drive.ready();
    return "did:hyper:".concat(drive.key.toString("hex"));
  });

  return function getDid(_x9) {
    return _ref6.apply(this, arguments);
  };
}();

exports.getDid = getDid;

var createDidHyper = Hyperdrive => {
  return new HyperId(Hyperdrive);
};

var _default = createDidHyper;
exports.default = _default;