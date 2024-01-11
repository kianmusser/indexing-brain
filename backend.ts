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
    const file = this.getSpecificFile(locAbbr, type);
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

export { Backend, NameType };
