import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const logScript = fileURLToPath(new URL("../plugins/pstack/skills/show-me-your-work/scripts/log.sh", import.meta.url));

test("formula cells are escaped and ordinary quoted text is preserved", () => {
  const dir = mkdtempSync(join(tmpdir(), "pstack-log-"));
  try {
    const log = join(dir, "log.tsv");
    const risky = ["=1+1", "+1", "-1", "@SUM(A1)"];
    const ordinary = ['"quoted"', '"unterminated', "plain"];
    for (const cell of [...risky, ...ordinary]) {
      execFileSync("bash", [logScript, log, "phase", cell, "why", "evidence", "result"]);
    }
    const rows = readFileSync(log, "utf8").trimEnd().split("\n").slice(1).map((line) => line.split("\t"));
    expect(rows.map((row) => row[2])).toEqual(["'=1+1", "'+1", "'-1", "'@SUM(A1)", '"quoted"', '"unterminated', "plain"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
