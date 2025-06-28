import fs from "fs";

const history = fs.readFileSync("history.txt", "utf-8").trim().split("\n");

const tableRows = history.map((line, index) => {
    const [member, judul, tanggal, cover] = line.split(" | ");
    const imageMarkdown = `<img src="${cover}" alt="${judul}" width="200"/>`; // ukuran medium (200px)
    return `| ${index + 1} | ${member} | ${judul} | ${tanggal} | ${imageMarkdown} |`;
});

const markdownTable = `# History IDN Live JKT48

| No | Member | Judul | Tanggal | Cover |
|----|--------|-------|---------|-------|
${tableRows.join("\n")}
`;

fs.writeFileSync("README.md", markdownTable);
console.log("README.md berhasil diperbarui!");
