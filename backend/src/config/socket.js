/**
 * Socket.io singleton — holds the io instance so services can emit events
 * without importing server.js (which would cause circular deps).
 */
let _io = null;

const setIo = (io) => {
  _io = io;
};

const getIo = () => {
  return _io;
};

/**
 * Safe emit helper — no-ops when io is not yet initialized (e.g. during tests).
 * @param {string} event
 * @param {*} payload
 */
const emit = (event, payload) => {
  if (_io) {
    _io.emit(event, payload);
  }
};

module.exports = { setIo, getIo, emit };
