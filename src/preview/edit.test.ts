import { describe, expect, it } from "vitest";
import { editOf, editValue, entryEdit, parseEdit } from "./edit";

/**
 * The attribute a card carries so a click in the preview can land in the
 * editor: written by the sections, read back by the click. The two have to
 * agree exactly, or a click opens nothing — so the round trip is the test.
 */

describe("the edit attribute", () => {
  it("names a file the way the editor does, and an entry in its notation", () => {
    expect(editValue("hero")).toBe("hero.json");
    expect(entryEdit("keyProjects", "projects", 2)).toBe("keyProjects.json#projects[2]");
  });

  it("reads back what it wrote", () => {
    expect(parseEdit(entryEdit("experience", "jobs", 0))).toEqual({
      file: "experience.json",
      where: "jobs[0]",
    });
    expect(parseEdit(editValue("thinking"))).toEqual({ file: "thinking.json", where: null });
    expect(editOf({ file: "skills.json", where: "categories[3]" })).toBe("skills.json#categories[3]");
  });

  it("refuses a value the page would not have written", () => {
    // What reaches the editor is posted across windows; a card that somehow
    // carried junk must not become a request to open a file by that name.
    expect(parseEdit("")).toBeNull();
    expect(parseEdit("hero")).toBeNull();
    expect(parseEdit("../secrets.json#x")).toBeNull();
    expect(parseEdit("hero.json#")).toBeNull();
  });
});
