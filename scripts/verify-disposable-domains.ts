import { isDisposableEmail } from "../src/lib/waitlist/disposableDomains";
const cases: [string, boolean][] = [
  ["foo@mailinator.com", true],
  ["foo@guerrillamail.com", true],
  ["foo@tempmail.org", true],
  ["rick@gmail.com", false],
  ["Rick@Gmail.com", false],
  ["bad", true], // malformed → block
];
for (const [input, expected] of cases) {
  const got = isDisposableEmail(input);
  if (got !== expected) throw new Error(`${input}: expected ${expected}, got ${got}`);
}
console.log("OK");
