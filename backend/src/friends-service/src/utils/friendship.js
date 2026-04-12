/**
 * @param {string} a
 * @param {string} b
 * @returns {[string, string]} [userLowId, userHighId] for Friendship rows
 */
function sortedPair(a, b) {
  if (a === b) {
    throw new Error('sortedPair: user ids must differ');
  }
  return a < b ? [a, b] : [b, a];
}

module.exports = { sortedPair };
