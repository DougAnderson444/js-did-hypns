"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateRandomString = exports.isDidValid = exports.parseDid = void 0;

var _errors = require("./errors");

const parseDid = did => {
  const match = did.match(/did:(\w+):(\w+).*/);

  if (!match) {
    throw new _errors.InvalidDid(did);
  }

  return {
    method: match[1],
    identifier: match[2]
  };
};

exports.parseDid = parseDid;

const isDidValid = did => {
  try {
    parseDid(did);
    return true;
  } catch (err) {
    return false;
  }
};

exports.isDidValid = isDidValid;

const generateRandomString = () => Math.random().toString(36).substring(2);

exports.generateRandomString = generateRandomString;