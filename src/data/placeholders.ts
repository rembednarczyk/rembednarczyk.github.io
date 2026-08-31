/**
 * Content that has to say a number the content cannot know.
 *
 * The hero states years of experience in two places and both are counted
 * from a date at load, so neither can be a literal — which is what kept
 * that text in a TypeScript file with a template string in it. A JSON file
 * has no template strings, so it writes `{{yearsOfExperience}}` and this
 * substitutes it.
 *
 * An unrecognised name throws rather than passing through. The alternative
 * is a page that renders `{{yearsOfExperiance}}` to a visitor and to every
 * crawler, and goes on doing it until somebody looks: a typo in content is
 * exactly the failure that has no other detector. It fires in the test
 * suite long before it could fire in a browser, because the content is
 * static and every test that renders the page loads it.
 */

/** `{{name}}`, with whitespace tolerated so an editor's spacing is not a bug. */
const PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g;

function fillOne(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(PLACEHOLDER, (_whole, name: string) => {
    const value = values[name];

    if (value === undefined) {
      throw new Error(
        `content asks for {{${name}}}, and the values on offer are ${Object.keys(values).join(", ")}`,
      );
    }

    return value;
  });
}

function walk(value: unknown, values: Readonly<Record<string, string>>): unknown {
  if (typeof value === "string") return fillOne(value, values);
  if (Array.isArray(value)) return value.map((item) => walk(item, values));

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, walk(item, values)]),
    );
  }

  return value;
}

/**
 * Every string anywhere in `content`, with its placeholders filled in.
 *
 * Reaches the whole tree rather than the two fields that need it today: a
 * substitution that works in some places and silently does not in others is
 * worse than none, because the one that does not is only found by reading
 * the page.
 */
export function fillPlaceholders<T>(
  content: T,
  values: Readonly<Record<string, string>>,
): T {
  return walk(content, values) as T;
}
