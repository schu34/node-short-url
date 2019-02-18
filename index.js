const http = require("http");
const {
  readFile: _readfile,
} = require("fs");
const {
  join,
} = require("path");
const {
  promisify,
} = require("util");

const urls = require("./urls");

const readFile = promisify(_readfile);
const ROOT_URL = process.env.SHORT_URL || "http://localhost:8000/";


function send404(res) {
  res.statusCode = 404;
  res.end();
}

function send400(error, res) {
  res.statusCode = 400;
  res.end(error || "bad request");
}

/**
 * reads an html file from the filesystem and sends it as a response;
 * @param {String} filename
 * @param {HttpResponse} res
 */
async function sendHtml(filename, res) {
  const html = await readFile(join(__dirname, filename));
  res.setHeader("Content-Type", "text/html");
  res.end(html.toString());
}

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const bodydata = [];
    req.on("data", (d) => {
      bodydata.push(d.toString());
    });
    req.on("end", () => {
      resolve(bodydata.reduce((a, b) => a + b, ""));
    });
    req.on("error", reject);
  });
}
const server = http.createServer(async (req, res) => {
  const {
    method,
    url,
  } = req;
  if (method === "GET") {
    if (url === "/") {
      return sendHtml("index.html", res);
    }
    if (url.split("/").length > 2) {
      return send404(res);
    }
    const urlToRedirectTo = urls.retrieve(url.split("/")[1].split("?")[0]);
    if (urlToRedirectTo) {
      res.statusCode = 302;
      res.setHeader("Location", urlToRedirectTo);
      res.end();
    } else {
      send404(res);
    }
  }
  if (method === "POST") {
    const body = await getRequestBody(req);
    const formdata = body.split("=");
    if (formdata.length !== 2 || formdata[0] !== "url") {
      return send400("invalid form data", res);
    }

    let bodyUrl;
    try {
      bodyUrl = new URL(decodeURIComponent(formdata[1]));
    } catch (e) {
      send400(e.message, res);
    }

    const shortname = urls.store(bodyUrl.href);
    const newurl = ROOT_URL + shortname;

    return res.end(`<a href="${newurl}">${newurl}</a>`);
  }
  return res.end("ERROR");
});

server.listen(process.env.PORT || 8000);