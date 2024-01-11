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
  constructor(nameDir: string) {
    this.nameDir = nameDir;
    this.locations = [];
  }

  async init() {
    this.locations = await this.getLocationsWithFolders();
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

  async search(): Promise<SearchResult[]> {
    return [];
  }
}

export { Backend };
