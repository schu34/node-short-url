const urlsToShornames = {};
const shortnamesToUrls = {};

function getMaxExpiry() {
  return new date(new Date().getTime() + 1000 * 60 * 60 * 24);
}

function store(url, _expiry) {
  console.log(url);
  const rand = Math.round(Math.random() * 1000000);
  console.log(rand);
  const shortname = rand.toString(36);
  console.log(shortname);
  if (urlsToShornames[url]) {
    console.log(urlsToShornames);
    return urlsToShornames[url];
  } else {
    urlsToShornames[url] = shortname;
    shortnamesToUrls[shortname] = url;
    return shortname;
  }
}

function retrieve(short) {
  console.log(short);
  return shortnamesToUrls[short];
}

module.exports = {
  store,
  retrieve
};
