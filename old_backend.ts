import * as path from "https://deno.land/std@0.211.0/path/mod.ts";
interface Location {
  abbr: string;
  name: string;
}

interface LocationWithFolder extends Location {
  folder: string;
}

enum NameType {
  Name = "N",
  Place = "P",
  Other = "O",
}

interface SearchResult {
  locAbbr: string;
  type: NameType;
  name: string;
}

class LocationNotFoundError extends Error {
  constructor(invalidLocAbbr: string) {
    super(`Location not found: '${invalidLocAbbr}'`);
    this.name = "LocationNotFoundError";
  }
}

class MultipleLocationsError extends Error {
  constructor(nameOrAbbr: string, invalidLocAbbr: string) {
    super(
      `Multiple locations with identical ${nameOrAbbr} found: '${invalidLocAbbr}'`,
    );
    this.name = "LocationNotFoundError";
  }
}

class Backend {
  private nameDir: string;
  private locations: LocationWithFolder[];
  private textDecoder: TextDecoder;
  constructor(nameDir: string) {
    this.nameDir = nameDir;
    this.locations = [];
    this.textDecoder = new TextDecoder();
  }

  async init() {
    this.locations = await this.getLocationsWithFolders();

    // check for duplicate country abbreviations and names
    const setOfLocAbbrs = new Set(this.locations.map((lwf) => lwf.abbr));
    const setOfLocNames = new Set(this.locations.map((lwf) => lwf.name));

    this.locations.forEach((lwf) => {
      if (setOfLocAbbrs.has(lwf.abbr)) {
        setOfLocAbbrs.delete(lwf.abbr);
      } else {
        throw new MultipleLocationsError("abbr", lwf.abbr);
      }
      if (setOfLocNames.has(lwf.name)) {
        setOfLocNames.delete(lwf.name);
      } else {
        throw new MultipleLocationsError("name", lwf.name);
      }
    });
  }

  getNameDir() {
    return this.nameDir;
  }

  private async getLocationsWithFolders(): Promise<LocationWithFolder[]> {
    const locations = [];
    for await (const dirEntry of Deno.readDir(this.nameDir)) {
      if (dirEntry.isDirectory) {
        const pieces = dirEntry.name.split(" ");
        if (pieces.length > 1) {
          const abbr = pieces[0];
          const name = pieces.slice(1).filter((p) => p !== "").join(" ");
          const folder = path.join(this.nameDir, dirEntry.name);
          locations.push({ abbr, name, folder });
        }
      }
    }
    return locations;
  }

  // public

  getLocations(): Location[] {
    return this.locations.map((lwf) => {
      return { name: lwf.name, abbr: lwf.abbr };
    });
  }

  private getSpecificFile(locAbbr: string, type: NameType) {
    const matchingLocations = this.locations.filter((lwf) =>
      lwf.abbr === locAbbr
    );
    if (matchingLocations.length === 0) {
      throw new LocationNotFoundError(locAbbr);
    } else if (matchingLocations.length > 1) {
      throw new MultipleLocationsError("abbr", locAbbr);
    }
    const curLoc = matchingLocations[0];

    const locAbbrTitleized = locAbbr[0].toUpperCase() +
      locAbbr.slice(1).toLowerCase();
    const fileName = `${locAbbrTitleized}${type}.txt`;
    return path.join(curLoc.folder, fileName);
  }

  private async specificSearch(
    query: string,
    type: NameType,
    locAbbr: string,
    maxCount: number,
  ): Promise<SearchResult[]> {
    let file: string;
    try {
      file = this.getSpecificFile(locAbbr, type);
    } catch (err) {
      if (err instanceof LocationNotFoundError) {
        return [];
      } else {
        throw err;
      }
    }
    const args = ["--crlf", "--max-count", String(maxCount), query, file];

    const command = new Deno.Command("/usr/bin/rg", { args });

    const { stdout } = await command.output();
    const lines = this.textDecoder.decode(stdout).split("\n");
    return lines.filter((l) => l !== "").map((l) => {
      return { locAbbr, type, name: l.trim() };
    });
  }

  async search(
    query: string,
    type: NameType,
    locAbbr: string,
  ): Promise<SearchResult[]> {
    return await this.specificSearch(query, type, locAbbr, 10);
  }
}

export { Backend, MultipleLocationsError, NameType };
