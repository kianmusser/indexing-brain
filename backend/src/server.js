import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import child_process from "node:child_process";
import cors from "cors";
import { Stream } from "node:stream";

const nameType = z.enum(["N", "P", "O"]);
/**
 * @typedef {z.infer<typeof nameType>} NameType
 */

/**
 * @typedef {object} Name
 * @property {string} name
 * @property {string} place
 */

// adapted from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/64910248
/**
 *
 * @param {string} str
 * @returns the titleized string
 */
const titleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

// from https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
/**
 *
 * @param {Stream} stream
 */
function streamToString(stream) {
  /** @type {Buffer[]} */
  const chunks = [];
  return new Promise(
    (/** @type {(value: string) => void} */ resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => {
        const str = Buffer.concat(chunks).toString("utf-8");
        resolve(str);
      });
    },
  );
}

class Server {
  #app;
  #port;
  #nameFolder;
  #maxResults;
  /**
   *
   * @param {number} port
   * @param {string} nameFolder
   */
  constructor(port, nameFolder) {
    this.#app = express();
    this.#port = port;
    this.#nameFolder = nameFolder;
    this.#maxResults = 100;

    this.#app.use(cors());

    this.#app.get("/", this.indexHandler.bind(this));
    this.#app.get("/locations", this.locationHandler.bind(this));
    this.#app.get("/search", this.searchHandler.bind(this));
  }

  /**
   *
   * @param {import("express").Request} _req
   * @param {import("express").Response} res
   */
  indexHandler(_req, res) {
    res.send("Indexing-Brain API Server");
  }

  async getLocations() {
    const dirs = await fs.readdir(this.#nameFolder, { withFileTypes: true });
    const locations = dirs
      .filter((d) => d.isDirectory())
      .flatMap((d) => {
        const pieces = d.name.split(" ");
        if (pieces.length < 2) return [];
        return [
          {
            abbr: pieces[0],
            name: pieces.slice(1).join(" "),
            folder: path.join(d.path, d.name),
          },
        ];
      });

    return locations;
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async locationHandler(req, res) {
    const locations = await this.getLocations();
    const locationsNoFolder = locations.map((l) => {
      const { abbr, name } = l;
      return { abbr, name };
    });
    res.send(locationsNoFolder);
  }

  /**
   * @param {NameType} type
   * @param {string[]} locs
   */
  async #getFilePaths(type, locs) {
    const locations = await this.getLocations();
    const filePaths = locations
      .filter((l) => locs.indexOf(l.abbr) !== -1)
      .map((l) => {
        const curFileName = `${titleCase(l.abbr)}${type}.txt`;
        return path.join(l.folder, curFileName);
      });
    return filePaths;
  }

  /**
   * @param {string} loc
   */
  async #getRelatedLocations(loc) {
    const relatedLocationsFile = path.join(
      this.#nameFolder,
      "meta",
      "relatedLocations.txt",
    );
    const relatedLocationsTxt = await fs.readFile(relatedLocationsFile, {
      encoding: "utf-8",
    });
    /** @type {Map<string, string[]>} */
    const relatedLocations = new Map();

    let curRelatedLocation;
    for (const line of relatedLocationsTxt.split("\n")) {
      const abbr = line.trim();
      if (abbr === "" || abbr.startsWith("//")) continue;
      if (line[0] === " ") {
        if (curRelatedLocation === undefined) {
          throw new Error(
            "received a related location without knowing what it's related to",
          );
        } else {
          const existingLocations = relatedLocations.get(curRelatedLocation);
          if (existingLocations !== undefined) {
            relatedLocations.set(curRelatedLocation, [
              ...existingLocations,
              abbr,
            ]);
          } else {
            relatedLocations.set(curRelatedLocation, [abbr]);
          }
        }
      } else {
        curRelatedLocation = abbr;
      }
    }
    const resultLocations = relatedLocations.get(loc);
    if (resultLocations === undefined) {
      return [];
    } else {
      return resultLocations;
    }
  }

  /**
   * @param {string} str
   */
  async #performReplacements(str) {
    const replacementsFile = path.join(
      this.#nameFolder,
      "meta",
      "replacements.txt",
    );
    const replacementsStr = await fs.readFile(replacementsFile, {
      encoding: "utf-8",
    });

    const replacements = replacementsStr
      .split("\n")
      .filter((line) => line !== "" && !line.startsWith("//"))
      .flatMap((line) => {
        const pieces = line.split(" -> ");
        const from = pieces[0];
        const to = pieces[1];
        if (from === undefined || to === undefined) {
          return [];
        } else {
          return [{ from, to }];
        }
      });

    const finalStr = replacements.reduce((prev, cur) => {
      return prev.replaceAll(cur.from, cur.to);
    }, str);

    return finalStr;
  }

  /**
   * @param {string} query
   * @param {NameType} type
   * @param {string[]} locations
   * @param {number} count
   */
  async search(query, type, locations, count) {
    this.#log(`SEARCH:`, query, type, locations, count);
    if (locations.length === 0) {
      return [];
    }
    const files = await this.#getFilePaths(type, locations);
    const proc = child_process.spawn("rg", [
      "--crlf",
      "-H",
      "-m",
      count.toString(),
      query,
      ...files,
    ]);
    const output = await streamToString(proc.stdout);
    return output.split("\n").flatMap((line) => {
      const l = line.trim();
      const pieces = l.split(":");
      if (pieces.length < 2) return [];
      const fileName = pieces.shift();
      if (fileName === undefined) return [];
      const name = pieces.join(":").trim();

      const place = fileName.split("/").slice(-1)[0].slice(0, -5).toUpperCase();
      return { name, place };
    });
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async searchHandler(req, res) {
    const locations = await this.getLocations();
    const locAbbrs = locations.map((l) => l.abbr);
    const searchParameters = z.object({
      query: z.string(),
      type: nameType,
      // @ts-ignore
      loc: z.custom((val) => locAbbrs.includes(val)),
    });

    let params;
    try {
      params = searchParameters.parse(req.query);
    } catch (err) {
      res.status(400);
      res.send("invalid request");
      return;
    }

    const result = {
      /** @type {Name[]} */
      specificResults: [],
      /** @type {Name[]} */
      relatedResults: [],
      /** @type {Name[]} */
      extendedResults: [],
    };

    const numResultsLeft = () => {
      return (
        this.#maxResults -
        (result.specificResults.length + result.relatedResults.length)
      );
    };

    const relatedLocAbbrs = await this.#getRelatedLocations(params.loc);

    const replacedQuery = await this.#performReplacements(params.query);

    // specific search
    result.specificResults = await this.search(
      replacedQuery,
      params.type,
      [params.loc],
      numResultsLeft(),
    );

    // related search
    if (relatedLocAbbrs.length > 0 && numResultsLeft() > 0) {
      result.relatedResults = await this.search(
        replacedQuery,
        params.type,
        relatedLocAbbrs,
        numResultsLeft(),
      );
    }

    // extended search
    if (numResultsLeft() > 0) {
      /** @type {string[]} */
      const alreadySearchedAbbrs = [params.loc, ...relatedLocAbbrs];
      const remainingAbbrs = locAbbrs.filter(
        (la) => !alreadySearchedAbbrs.includes(la),
      );
      result.extendedResults = await this.search(
        replacedQuery,
        params.type,
        remainingAbbrs,
        numResultsLeft(),
      );
    }

    res.send(result);
  }

  // @ts-ignore
  #log(...args) {
    console.log("IB>", ...args);
  }

  run() {
    this.#app.listen(this.#port, () => {
      this.#log(`name folder ${this.#nameFolder}`);
      this.#log(`listening on port ${this.#port}`);
    });
  }
}

export { Server };
