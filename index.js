const http = require("http");
const {
  readFile: _readfile
} = require("fs");
const {
  join
} = require("path");
const {
  promisify
} = require("util");

const ROOT_URL = process.env.SHORT_URL || 'http://localhost:8000';

const urls = require("./urls");
const readFile = promisify(_readfile);

const server = http.createServer((req, res) => {
  const {
    method,
    url
  } = req;
  console.log(method, url);
  if (method === "GET") {
    if (url === "/") {
      sendHtml("index.html", res);
    } else {
      if (url.split("/").length > 2) {
        send404(res);
      } else {
        const urlToRedirectTo = urls.retrieve(url.split("/")[1].split("?")[0]);
        if (urlToRedirectTo) {
          res.statusCode = 302;
          res.setHeader("Location", urlToRedirectTo);
          res.end();
        } else {
          send404(res);
        }
      }
    }
    // return res.end("GET " + url);
  } else if (method === "POST") {
    const bodydata = [];
    req.on("data", d => {
      bodydata.push(d.toString());
      // console.log(d, "\n\n");
    });
    req.on("end", () => {
      const body = bodydata.reduce((a, b) => a + b);
      console.log(body);
      const formdata = body.split("=");
      if (formdata.length !== 2 || formdata[0] !== "url") {
        send400("invalid form data", res);
      }
      console.log(formdata);

      let bodyUrl;
      try {
        bodyUrl = new URL(decodeURIComponent(formdata[1]));
      } catch (e) {
        send400(e.message, res);
      }

      const shortname = urls.store(bodyUrl.href);
      const newurl = ROOT_URL + shortname;
      console.log(newurl);

      return res.end(`<a href="${newurl}">${newurl}</a>`);
    });
  } else {
    res.end("ERROR");
  }
});

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

server.listen(process.env.PORT || 8000);