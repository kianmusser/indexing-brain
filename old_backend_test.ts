import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";
import { Backend, MultipleLocationsError, NameType } from "./old_backend.ts";
import * as path from "https://deno.land/std@0.211.0/path/mod.ts";
import { fail } from "https://deno.land/std@0.211.0/assert/fail.ts";

Deno.test("backend", async (t) => {
  const rootTestDir = await Deno.makeTempDir();

  const createBackendWithLocations = async (locations: string[]) => {
    const testDir = await Deno.makeTempDir({ dir: rootTestDir });
    await Promise.all(
      locations.map((curLoc) => Deno.mkdir(`${testDir}/${curLoc}`)),
    );
    const backend = new Backend(testDir);
    await backend.init();
    return backend;
  };

  const writeTestNames = async (
    b: Backend,
    folderAndFileName: string,
    names: string[],
  ) => {
    const rootFolder = b.getNameDir();
    const file = path.join(rootFolder, folderAndFileName);
    await Deno.writeTextFile(file, names.join("\n"));
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

  await t.step("search should return results for single loc.", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander",
      "Murphy",
    ]);
    assertEquals(
      (await backend.search("a", NameType.Name, "EGL")).map((sr) => sr.name),
      ["Alexander"],
    );
  });

  await t.step("search should fallback to all loc same type", async () => {
    const backend = await createBackendWithLocations([
      "EGL England",
      "CAN Canada",
    ]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander",
    ]);
    await writeTestNames(backend, "CAN Canada/CanN.txt", [
      "Allen",
    ]);
    assertEquals(
      await backend.search("a", NameType.Name, "EGL"),
      [{ locAbbr: "EGL", type: NameType.Place, name: "Alexander" }],
    );
  });

  await t.step("search should return multiple expected results", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander",
      "Allen",
    ]);
    assertEquals(
      (await backend.search("e", NameType.Name, "EGL")).map((sr) => sr.name),
      ["Alexander", "Allen"],
    );
  });

  await t.step("search should return regex results", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander",
      "Allen",
    ]);
    assertEquals(
      (await backend.search("^A.*r$", NameType.Name, "EGL")).map((sr) =>
        sr.name
      ),
      ["Alexander"],
    );
  });

  await t.step("search should trim returned results", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander ",
      "Allen",
    ]);
    assertEquals(
      (await backend.search("A", NameType.Name, "EGL")).map((sr) => sr.name),
      ["Alexander", "Allen"],
    );
  });

  await t.step("search should NOT trim before search", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      " Alexander",
      "Allen",
    ]);
    assertEquals(
      (await backend.search("^A", NameType.Name, "EGL")).map((sr) => sr.name),
      ["Allen"],
    );
  });

  await t.step("search should return 0 res on unknown country", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    await writeTestNames(backend, "EGL England/EglN.txt", [
      "Alexander",
      "Allen",
    ]);
    assertEquals(
      (await backend.search("^A", NameType.Name, "CAN")).map((sr) => sr.name),
      [],
    );
  });

  await t.step("search should return 0 res on no file country", async () => {
    const backend = await createBackendWithLocations(["EGL England"]);
    assertEquals(
      (await backend.search("^A", NameType.Name, "EGL")).map((sr) => sr.name),
      [],
    );
  });

  await t.step("backend should err when >1 loc. same abbr", async () => {
    try {
      await createBackendWithLocations(["EGL England", "EGL English"]);
    } catch (err) {
      if (err instanceof MultipleLocationsError) {
        return;
      } else {
        throw err;
      }
    }
    fail("Backend should have thrown an error");
  });

  await t.step("backend should err when >1 loc. same name", async () => {
    try {
      await createBackendWithLocations(["EGL England", "EG England"]);
    } catch (err) {
      if (err instanceof MultipleLocationsError) {
        return;
      } else {
        throw err;
      }
    }
    fail("Backend should have thrown an error");
  });

  await Deno.remove(rootTestDir, { recursive: true });
});
