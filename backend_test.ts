import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";
import { Backend } from "./backend.ts";

/*
async function scaffoldTestFolder () {
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

Deno.test("backend", async (t) => {
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

  await t.step("getLocations should handle a single location", async () => {
    const backend = await createBackendWithLocations([
      "USA United States of America",
    ]);
    assertEquals(backend.getLocations(), [{
      abbr: "USA",
      name: "United States of America",
    }]);
  });

  await t.step("getLocations should handle multiple locations", async () => {
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

  await t.step("getLocations should handle trailing spaces", async () => {
    const backend = await createBackendWithLocations([
      "EGL England ",
    ]);
    assertEquals(backend.getLocations(), [
      { abbr: "EGL", name: "England" },
    ]);
  });

  await t.step("getLocations should handle multiple spaces", async () => {
    const backend = await createBackendWithLocations([
      "USA United States  of America",
    ]);
    assertEquals(backend.getLocations(), [
      { abbr: "USA", name: "United States of America" },
    ]);
  });

  await t.step("getLocations should ignore folders w/o name", async () => {
    const backend = await createBackendWithLocations([
      "meta",
    ]);
    assertEquals(backend.getLocations(), []);
  });

  await Deno.remove(rootTestDir, { recursive: true });
});
