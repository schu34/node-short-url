const urlsToShornames = {};
const shortnamesToUrls = {};

function store(url) {
  const rand = Math.round(Math.random() * 1000000);
  const shortname = rand.toString(36);
  if (urlsToShornames[url]) {
    return urlsToShornames[url];
  }
  urlsToShornames[url] = shortname;
  shortnamesToUrls[shortname] = url;
  return shortname;
}

function retrieve(short) {
  return shortnamesToUrls[short];
}

module.exports = {
  store,
  retrieve,
};