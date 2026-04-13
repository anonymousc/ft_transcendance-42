const NOTIFY_TYPES = {
  FRIEND_REQUEST_RECEIVED: 'FRIEND_REQUEST_RECEIVED',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FRIENDSHIP_CREATED: 'FRIENDSHIP_CREATED',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
};

/**
 * @param {unknown} data
 */
function normalizeJsonData(data) {
  if (data === undefined || data === null) return undefined;
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return undefined;
    try {
      return JSON.parse(t);
    } catch {
      throw new Error('INVALID_DATA_JSON');
    }
  }
  if (typeof data === 'object') {
    return (data);
  }
  throw new Error('INVALID_DATA_TYPE');
}

module.exports = { normalizeJsonData, NOTIFY_TYPES };
