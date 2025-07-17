const songCache = {};

export function getCachedSongs(searchType, query) {
  return songCache[`${searchType}:${query}`];
}

export function setCachedSongs(searchType, query, tracks) {
  songCache[`${searchType}:${query}`] = tracks;
}