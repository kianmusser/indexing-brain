import express from "express";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import fs from "node:fs/promises";
import { z } from "zod";
import child_process from "node:child_process";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// adapted from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/64910248
const titleCase = (str) => str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());


// from https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}


class Server {
  constructor(port, nameFolder) {
    this.app = express();
    this.port = port;
    this.nameFolder = nameFolder;

    this.app.use(cors());

    this.app.get("/", this.indexHandler.bind(this));
    this.app.get("/locations", this.locationHandler.bind(this));
    this.app.get("/search", this.searchHandler.bind(this));
  }

  indexHandler(req, res) {
    res.send("Indexing-Brain API Server");
  }

  async getLocations() {
    const dirs = await fs.readdir(this.nameFolder, { withFileTypes: true });
    const locations = dirs
      .filter((d) => d.isDirectory())
      .map((d) => {
        const pieces = d.name.split(" ");
        if (pieces.length < 2) return null;
        return {
          abbr: pieces[0],
          name: pieces.slice(1).join(" "),
          folder: path.join(d.path, d.name),
        };
      })
      .filter((l) => l !== null);
    return locations;

  }

  async locationHandler(req, res) {
    const locations = await this.getLocations();
    const locationsNoFolder = locations.map((l) => {
      const { abbr, name } = l;
      return { abbr, name };
    });
    res.send(locationsNoFolder);
  }

  async search(query, files, count) {
    const proc = child_process.spawn("/usr/bin/rg", ["--crlf", "-H", "-m", count, query, ...files]);
    const output = await streamToString(proc.stdout);
    return output.split("\n").map((line) => {
      const l = line.trim();
      if (l === "") return undefined;
      const pieces = l.split(":");
      const fileName = pieces.shift();
      const name = pieces.join(":").trim();

      const place = fileName.split("/").slice(-1)[0].slice(0, -5).toUpperCase();
      return { name, place };

    }).filter((sr) => sr !== undefined);
  }

  async searchHandler(req, res) {
    const locations = await this.getLocations();
    const locAbbrs = locations.map((l) => l.abbr);
    const searchParameters = z.object({
      query: z.string(),
      type: z.enum(["N", "P", "O"]),
      loc: z.enum(locAbbrs),
    });

    let params;
    try {
      params = searchParameters.parse(req.query);
    } catch (err) {
      res.status(400);
      res.send("invalid request");
      return;
    }

    const curLoc = locations.filter((l) => l.abbr === params.loc)[0];
    const curFileName = `${titleCase(curLoc.abbr)}${params.type}.txt`
    const curFilePath = path.join(curLoc.folder, curFileName);
    console.log(params, curFilePath);

    let results = [];
    const output = await this.search(params.query, [curFilePath], 100);
    results.push(...output);

    res.send({ specificResults: results });
  }

  log(...args) {
    console.log("IB>", ...args);
  }

  run() {
    this.app.listen(this.port, () => {
      this.log(`listening on port ${this.port}`);
    });
  }
}

const nameFolder = path.join(__dirname, "../../names");

const srv = new Server(3000, nameFolder);

srv.run();