import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";
import { Backend } from "./backend.ts";

/*
async function scaffoldTestFolder () {
    const rootDir = await Deno.makeTempDir();
    const usaDir = `${rootDir}/USA United States of America`;
    const englandDir = `${rootDir}/EGL England`;
    await Promise.all([Deno.mkdir(usaDir), Deno.mkdir(englandDir)]);

    await Deno.writeTextFile(`${usaDir}/UsaN.txt`,
        `Alex
        Rebecca
        Jimmy`
    );
    await Deno.writeTextFile(`${usaDir}/UsaP.txt`,
        `Chicago
        Detroit
        New York City`
    );
    await Deno.writeTextFile(`${englandDir}/EglN.txt`,
        `Alexander
        Elizabeth
        Matthias`
    );
    // should not show up in any search
    await Deno.writeTextFile(`${englandDir}/EglA.txt`,
        `Alexander
        Elizabeth
        Matthias`
    );
}
*/

Deno.test("locations", async (t) => {
  const rootTestDir = await Deno.makeTempDir();

  const createBackendWithLocations = async (locations: string[]) => {
    const testDir = await Deno.makeTempDir({ dir: rootTestDir });
    Promise.all(locations.map((curLoc) => {
      return Deno.mkdir(`${testDir}/${curLoc}`);
    }));
    const backend = new Backend(testDir);
    await backend.init();
    return backend;
  };

  await t.step("should handle a single location", async () => {
    const backend = await createBackendWithLocations([
      "USA United States of America",
    ]);
    assertEquals(backend.getLocations(), [{
      abbr: "USA",
      name: "United States of America",
    }]);
  });

  await t.step("should handle multiple locations", async () => {
    const backend = await createBackendWithLocations([
      "USA United States of America",
      "EGL England",
      "CA Canada",
    ]);
    assertEquals(backend.getLocations(), [
      { abbr: "CA", name: "Canada" },
      { abbr: "EGL", name: "England" },
      { abbr: "USA", name: "United States of America" },
    ]);
  });

  await t.step("should handle trailing spaces", async () => {
    const backend = await createBackendWithLocations([
      "EGL England ",
    ]);
    assertEquals(backend.getLocations(), [
      { abbr: "EGL", name: "England" },
    ]);
  });

  await t.step("should handle multiple spaces", async () => {
    const backend = await createBackendWithLocations([
      "USA United States  of America",
    ]);
    assertEquals(backend.getLocations(), [
      { abbr: "USA", name: "United States of America" },
    ]);
  });

  await t.step("should ignore folders without a name", async () => {
    const backend = await createBackendWithLocations([
      "meta",
    ]);
    assertEquals(backend.getLocations(), []);
  });

  await Deno.remove(rootTestDir, { recursive: true });
});
