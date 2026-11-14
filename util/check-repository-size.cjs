const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const totalWarningBytes = 350 * 1024 * 1024;
const singleFileLimitBytes = 90 * 1024 * 1024;

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
})
    .split("\0")
    .filter(Boolean);

const entries = trackedFiles.map((file) => {
    const absolutePath = path.join(root, file);
    return { file, size: fs.statSync(absolutePath).size };
});

entries.sort((a, b) => b.size - a.size);
const totalBytes = entries.reduce((total, entry) => total + entry.size, 0);
const formatMiB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

console.log(`Tracked files: ${entries.length}`);
console.log(`Tracked size: ${formatMiB(totalBytes)} MiB`);
console.log("Largest tracked files:");
for (const entry of entries.slice(0, 20)) {
    console.log(`  ${formatMiB(entry.size)} MiB  ${entry.file}`);
}

if (totalBytes >= totalWarningBytes) {
    console.warn(
        `::warning::Tracked repository size is ${formatMiB(totalBytes)} MiB; review domain-data retention and migration policy.`
    );
}

const oversized = entries.filter((entry) => entry.size >= singleFileLimitBytes);
if (oversized.length > 0) {
    for (const entry of oversized) {
        console.error(
            `::error::Tracked file exceeds the 90 MiB guard: ${entry.file} (${formatMiB(entry.size)} MiB)`
        );
    }
    process.exitCode = 1;
}
