class Backend {
  private nameDir: string;
  constructor(nameDir: string) {
    this.nameDir = nameDir;
  }

  async getLocations() {
    const locations = [];
    for await (const dirEntry of Deno.readDir(this.nameDir)) {
      if (dirEntry.isDirectory) {
        const pieces = dirEntry.name.split(" ");
        if (pieces.length > 1) {
          const abbr = pieces[0];
          const name = pieces.slice(1).filter((p) => p !== "").join(" ");
          locations.push({ abbr, name });
        }
      }
    }
    return locations;
  }
}

export { Backend };
