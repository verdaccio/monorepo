// @flow

import {PassThrough} from 'stream';

// import type {IUploadTarball, IReadTarball} from '@verdaccio/streams';

/**
 * This stream is used to read tarballs from repository..
 * @param {*} options
 * @return {Stream}
 */
class ReadTarball extends PassThrough {

  /**
   *
   * @param {Object} options
   */
  constructor(options: duplexStreamOptions) {
    super(options);
    // called when data is not needed anymore
    addAbstractMethods(this, 'abort');
  }
}

/**
 * This stream is used to upload tarballs to a repository.
 * @param {*} options
 * @return {Stream}
 */
class UploadTarball extends PassThrough {

  /**
   *
   * @param {Object} options
   */
  constructor(options: duplexStreamOptions) {
    super(options);
    // called when user closes connection before upload finishes
    addAbstractMethods(this, 'abort');

    // called when upload finishes successfully
    addAbstractMethods(this, 'done');
  }
}

/**
 * This function intercepts abstract calls and replays them allowing.
 * us to attach those functions after we are ready to do so
 * @param {*} self
 * @param {*} name
 */
// Perhaps someone knows a better way to write this
function addAbstractMethods(self, name) {
  // $FlowFixMe
  self._called_methods = self._called_methods || {};
  // $FlowFixMe
  self.__defineGetter__(name, function() {
    return function() {
      // $FlowFixMe
      self._called_methods[name] = true;
    };
  });
  // $FlowFixMe
  self.__defineSetter__(name, function(fn) {
    // $FlowFixMe
    delete self[name];
    // $FlowFixMe
    self[name] = fn;
    // $FlowFixMe
    if (self._called_methods && self._called_methods[name]) {
      delete self._called_methods[name];
      // $FlowFixMe
      self[name]();
    }
  });
}

export {ReadTarball, UploadTarball};
