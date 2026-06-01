'use strict';
// n8n loads nodes/credentials from the "n8n" field in package.json; this index
// is just a convenience re-export.
module.exports = {
  Invovate: require('./nodes/Invovate/Invovate.node.js').Invovate,
  InvovateApi: require('./credentials/InvovateApi.credentials.js').InvovateApi,
};
