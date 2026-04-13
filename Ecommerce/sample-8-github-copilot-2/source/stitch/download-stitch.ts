import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_DIR = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_DIR, "stitch");

const screens = [
  {
    id: "18bea4c0326642de8153ac10bb3c3d32",
    title: "trang-chu",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugA_F7emB-V6OjykWM2an5446Uf0tT27a2aUs9hrC2mNen2zr5rdg6Q_IJW4Zi7tr6cDgs4_FusHHfmw8Xi4vvlFa4sgGTmHsAiqC-ERISeEHQpu91YY1KLY0cKuACeEy0m0zYbi9ZIMv_rOM5L6fuLq6bu6x9TBOWIdPEKeuue0m1VSARjnImaXuLIYSpIacwWaf5dHANAjjxpcirAYcFmghHWKbRkgBLJrkBWw-uQvFA7pPXh-21gREOq",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkyYThmN2FjMWRmYjRmNTlhOTZmNDM3NWQ5ODI2N2NiEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "df74666b711946e5824d1d6ff61e43be",
    title: "tim-kiem-danh-muc",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugZRhN4LVoQR6azABCZsk_ilSAu-8oE24Lxc2jKIjAcxMihL1phV_5MKM8XI13JSIxPhv5b3nffjVPRHPCUFlb2iNiftnHBpHkX4850Tx6u2Lw7uui9yy0CHW3dboVJ--EzE-23wX7NNyZ5Acypw4U6eX77TFZdL4Pi-H5NgsFcR7gu_dosQEyJCjc0OCMLVaBcv9qZy5J83h7g5mECnCJlUQJEfECFUwzAISSroCAcLrCfd1LxkSF-b9I",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzczOWE1ZWNmMDQyZjRkMjU4NmFjZTllNjQ3OGQzZTE2EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "e8282a9a58b745b8b2e2153677ae773f",
    title: "chi-tiet-san-pham",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugN1Z4BD7jkIWVUkxJvI-KJX_V_LzQcD1F38LU8WVeCy9T9KpbdFikGP1aCD_PqZJwygnqx2Chg2iaY0HPLjSZBoAdb_3Za9hKNE5frSOVay3ST9xeaJggjeeyVOxADIBd0q3w-nUQHWB-qNQNDeFChBr1PTrgZFdr0fJXG8IVIHRqcRXAzRH4Zx2kR7DXtyTTa9MD0yEZhSmlbbo3G2GgmN31mSCmh51qSbSCOlZkeOg9xXGah59GIO3Vy",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY4ZjIxZWFlODkwZjQ2MWNhNDM1OTQxZWIyYzUyYjliEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "b78224ef455c4e9087c2e0ded38b4dfa",
    title: "gio-hang",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uglwsEFLqm3kgEOPwa3E67__Zczkuv_eU9wBPzdnW8OQZs-vFgwWdlPm0enPHNgPmJudq4U2jErpdVWZXzUEqhjUu9eQMcvSu94wNQnxO-60S-QhSAmdnXB6gywtJ6z4Tzi1BrI0ykadoOua8yHLkjqXn0Cql_HUSm-i7J5zny7ZbrFS5ag3UTcHCa-6-mJYbigNL79U7YgU9y0F-eYa35s1gFpZqCuURFbeJiXVv5wIFqyqfsaMT0QXhz0",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdkMzk1NGNlM2VkODRkMGJiZTllMTdjNzI0YTZiZDFkEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "8197757d0d9b42e9bf19d7fddd3563a6",
    title: "thanh-toan",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uh9wJK1DCaq4eWTauweKG15P57Z90l75sevP97on4Irb5ucNE3HB22WA5BRnZ0nMuKsYQ64VaNmjdNTAKvobOwEHr4jU6zIpX3WfFQaI0PASlZZb_lR9d7BHwmNI_l37bEBbtyvk0g9rnKhdmoRUOJkO85Ml8pTDCFSXkmj9ahZ3Q0ncbTN2I0ikTtIMino4Mln1EqxZ9aLtcZ9-FhiR6_a7gzqe-Cr75CgR69ncwWG2tQjOrC1RLBSG9v_",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI4YzAxMDc4YjU1ZjRmYTRiYzUwZTJmMDVhNzgwNDFkEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "016da833e14840ff841728ba08e29403",
    title: "dang-nhap",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujgEqb5xKbxC_rdO1bgTbVy_QrAlA3f6fSa7zv8VOJ5zahYuIZzrWLduvptomCmudiZNV7VGa73cGpRcmG2jHyTwFbrh-YFhS3z8Nr8D9gvZT8gXfxjhz9sCOEtIG4uTJKsP1qlCAUxhLy-63I00FkQXAbXK4HFMuh1ndf0SqOFIM6_oIA_mSl_rul2uA8y3Jd0qCmqnAZflz2AENwo8rFCJWNWJ1DnuQ6AdDeiog1O65eYKHvifvZqNto",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQwY2UxYTQzZDQ3NzQ4OGZhZWViYTRhNmRiMGU1OGM5EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "cdba8c4c256e48f68d81b4f39d032ced",
    title: "dang-ky",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujZkaZeJfsscYiM2iY4XzR3MBd8ZUizPkVbOmOEnhAKrFBj5WHj5DVHj26V3MdcOWJX3W6GlN-4POx8-M39E43Gm5q3tyVZoZnMGCpG71FDHWFihLASZf-AgAuvYB7FC0ZxHD11VovwoE--TZwgs3uopB_PyVCAgwm8eiwU6yWScmW-PsSHyYQYDzYXeUccgurdzS5HaUKnpAHZZBK3G9_T4JyZh2aLm81E5S_yeNKLawO4lea6W4vUgNYn",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FhYWQ4YWFjZWQ4MDRkODU5NjFjMGM5YWZmZGVlYTlkEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "2bd4ac5309304b1fa6d079159d9f86af",
    title: "ho-so-don-hang",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uipWZx-rxxYAx2wYQtQ66eRuSENwfXV7cmIlOhI1JiEPmiSexJ2aiUjI79KBAySYkj3HDp2WmaBaBDlUueGhw4jmzLP-_ByGPduVLc2Og4enswDkbBRRobHXyo_PkvOzx2VAmA845r3ooQ97lNsKaAHa7k27gp3oC1GcG1PVRF7AjG7iQEQLPOe-qLAhfCzxCT6pGj3a_qEMc3H3DEvyF6Fpu8GIkpPdJceFgxr8IuaXSK8r-6LjAua4GXK",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE1M2E4OGNhZWRiODQwYmQ4NjcyZWJiZTdiMjllMzNmEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
  {
    id: "c400681de5d34942aeeb3211371fb4a2",
    title: "admin-dashboard",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhpFumwnj4zjD4dqqO-gv_y0cF-6OIyfXYiU2qpV0sG6jR0AG9ZjUKV-3yr7sPGbzZWawqYp5F4f0ssYhii3L8Hhb1BdvzoXmgdCB8upOLuStSwhN6A7V3GfTM8CeSSAHgtd0-J7MzVJ95L6hZXZWoK3pc3Q4MLjx1atPSZLONyifjDUmFcg0WVkFXQ98gh251W3R92niQpcQtMKQ0qpfCzZvZz0EgqpazROVxkRKi0idpkK0Pv1e446LDt",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQzZDRjYWVkOTQzNjRlODBiNDlmN2MyOGY1ZGRhMjI1EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzMzNDQ4MjQ5OTY4MjY0MTE2Mw&filename=&opi=89354086",
  },
];

async function downloadFile(url: string, dest: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      execSync(`curl -sL --max-time 30 -o "${dest}" "${url}"`, { stdio: "pipe" });
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const htmlDir = path.join(OUT_DIR, "html");
  const screenshotsDir = path.join(OUT_DIR, "screenshots");

  await mkdir(htmlDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });

  for (const screen of screens) {
    console.log(`Downloading: ${screen.title}`);

    const htmlPath = path.join(htmlDir, `${screen.title}.html`);
    const screenshotPath = path.join(screenshotsDir, `${screen.title}.png`);

    if (!existsSync(htmlPath)) {
      await downloadFile(screen.htmlUrl, htmlPath);
      console.log(`  ✓ HTML: ${screen.title}.html`);
    } else {
      console.log(`  → HTML already exists: ${screen.title}.html`);
    }

    if (!existsSync(screenshotPath)) {
      await downloadFile(screen.screenshotUrl, screenshotPath);
      console.log(`  ✓ Screenshot: ${screen.title}.png`);
    } else {
      console.log(`  → Screenshot already exists: ${screen.title}.png`);
    }
  }

  console.log("\n✅ All Stitch assets downloaded successfully!");
  console.log(`   HTML files: ${htmlDir}`);
  console.log(`   Screenshots: ${screenshotsDir}`);
}

main().catch(console.error);
