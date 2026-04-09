import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type StitchScreen = {
  id: string;
  title: string;
  htmlUrl: string;
  screenshotUrl: string;
};

const projectId = "16350391539561472399";
const designSystemId = "asset-stub-assets-d64cb065f44040cbb91714676f7fca86-1775531969992";

const designSystem = {
  id: designSystemId,
  displayName: "Kinetic Marketplace",
  primary: "#b22203",
  primaryContainer: "#ff775b",
  surface: "#f6f6f6",
  surfaceLow: "#f0f1f1",
  surfaceLowest: "#ffffff",
  text: "#2d2f2f",
  accent: "#7f3f9f",
  radius: "0.75rem",
  glass: "rgba(255, 255, 255, 0.7)",
  blur: "24px",
};

const screens: StitchScreen[] = [
  {
    id: "37f054f266fb47c5ae192eb4a9da3dc6",
    title: "homepage",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzliM2NmZmNjYzczMzRjMjQ4MzA5ZmIxNzliMWI4NzYxEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugrdw37wXaAZ4IlUKafPzrNb15aiXrEqZQ9ebkuFIM7v5OLAi3hW72lp_jy6oCiMyu1kpwyk4u4t4fTNrL4SWxyG9K3UXB64uS7mz5pTnWKcWvZcP0JuHy6fGRiBKeodqMYqV8zHtMe19JGdI0CpT1mSFFDWgUk9JuEYIZ2nJoxjJH5UIuv2tmEtuPO1T5zW8Kkb1QDEb3Fy0cxzT5V00UCaQG0p0SiZq888yji605px-ql_oCxH3CBT98i",
  },
  {
    id: "2dc8d45b23724f28bcc07ffeed2ef9ef",
    title: "product-detail",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFjMjhlNDU1OGE0MjRhMzI5ZmJkM2QwMmFiNDA1MjA3EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugqFWmqmmd3lgFMWOYG2f5WQilgG9Fpy2hR8UU96OrP4aGaMM9GhpfqO0ff7TuO4kYQX9lFxmQ8uqXXSqgCJjACexSEJb4mF6L9hevBtKVK0GWjXQZzp6ydFKMViiBBMnEjAkblw4WuNf1KjKbAzvj-Budx-b9GbWv2Ej6J8c2W3Fpm7fHKBQh3e-yg_1wXZgzruFCY3yvYjZDH5kY9vf2WND73oeoIDzH5O7Pfrf0WPgRV9H0QEss2-ocx",
  },
  {
    id: "36080bcfeae94cb7aced0e764751468f",
    title: "shopping-cart",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkxMGNjN2E2NjJiYjRiYWViZTM1ZmZjMTU4ZDYzMjE1EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugm1mBQtfcUXvfuX9QKuKPSF20lcHN6JPwOITNm8-HZhoDaOS3K776h53wXQNupcbfg2ljRzbE09Q6mbIj8xJEOksbsP1mZgppZj1D7p73gJbBB97o4rxr8zSs_-YXapAJzepmk1E4Hv8QwINQEEpoitvg4A83LO8W53CSsocF0YHiSL0MD_MtipnkB_6at7ozmpenkOQbToK-yoUm9O_XXjpfW9fUzc0SFqiesaBRDunW9rIiidkSWNbU",
  },
  {
    id: "b2da4f4710f849a4a46afee0f12ef261",
    title: "admin-dashboard",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM0Y2RiODA4OTJjNTQwNjU5NzdjZTgwMTE1MzcwZTkwEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujuz0tmD_afzMoP68-MXimBsF_swH3M90YfH4Ig2x1cb0a01Z7EGxH6kmuvehOKfei7UAXfO0c2CCEmSTFDTuDocp9E9FFl_oKspHiwli1cVjzK8BFgMhGC1Yw0Xhx9GHlnvg-IB3513ptzNNxrSNsCh85BIsb_3_MdA1mjTTJMEFLV7r0ExFciZCdUTp_tC03ct-C1FyGL7JBuW84AhAIltGAbwXFsdf0i_m7qlSx84MFCCJO9JG5xBAm4",
  },
  {
    id: "7cd34e1609e14c6e9bb8f09c64076037",
    title: "login",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI0YTY1MTE4MDI2ZjQ2MmY4OTZhMWI3NmRmMWI1MzlhEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiEJJA0gIat5WeiyvZQz5fm8FYEPNu_O7KfHCL7AFbKWdjg_gStD3e3VZbMQs3mK8xcaq-h-u88-55BFaZOFUA7NsZxGuu4nLQqo7eP5AjCliwnMeg_jOnMGfHtG-Kqf56UOtNWf0IcF3zkvhFvOxfZQe-Unxhs76RgcFsc2I4Jm1ot-0roiixrBa4_OmpQnPF3s1cVaZccSX65sRCF6PFfAIFzaCCzmtPgFPcsMnKRE-vTRWNqL3p_0mN-",
  },
  {
    id: "d9b8370f48d145bebde842768c1a04f9",
    title: "search-results",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U1MmIzZmNlNGMzOTQ3YzlhNjM1NmY5ZTM4ZTQ3OGE3EgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugc121Y6eFgYdTb6LjGUJ2hnWESPYTvbBeZPc2stV57t2R4IEinrn1CbW7mtLVHR1ez0qpHMZBwyuQ5SI8MgreSzfbMJFcm7-FCxVnzccRWOx1igNVKt3u2KVcyuqrgsLOxQKPPJQ-AGZDNrNv3x-W-WCiDfWfFnT1yMcw-izExX1ribe570rMPiBUJZZ8lAh4M8vYrqjChaII6O3hwwYphMWGC8OWgFPLmswfN8ldCqlWWiQ_jvzP6xN3p",
  },
  {
    id: "49615c7e6f45457085ec283042ddef8c",
    title: "register",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Q1OTkwN2VmZjA2MzRmYWZiOGJkOTBlZjQwMmRiYmZmEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhUUioVjfwF5HgwbHRmPASsNxSiWN-rzXfobsoOCcnqGP4ihUBlUzlxCWh6AJe8wkHaohA1AIj1QDlAmStDYifY-t-oQ8wl1Tf3neQRMxSh33cKqDq8ErLUnkZtwFGjdqGvLHGjMoXgN6VqURLEucXIUJ4bRYRXX5suMuQonqxhmjg_rD8Vba33kc7-2htUPrlqRWD0_8q7Fs7tmZ723IEcnUjfwi6oE2UV0ZQgdp9ONWOM9woj4JZh23Co",
  },
  {
    id: "d4090930c34441b98b26d7a8a2aadccd",
    title: "my-orders",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE5ZDc0NzAzYzM1NTQ2Y2U4N2ZmODZiNzMxNTI2YjMyEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiJzdD-Ia7h7r1t4AIJezvu7ZRKR8_aMahlfYAmilPe8aGntg61_kE_RThx5n6KqQ3atCwXIKM1akTb3Qoc8dxMPuVEf8y4-mcP7un4VPGUiszSqwnii4-qQkcQobfcvnGfZ87IjIa2H8vx70WO1dfm4_7R6RcDCVvoy3U55bxRH0bDSKqE-mOP13HAiNnYodCTgZu1YXr788NLrwega2Cq1RCzk8L-THbZWzc0u4NSX_OZvPdRdmaoZH0",
  },
  {
    id: "b238cd5866364e7bb92b1def575b71cb",
    title: "product-management",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhlOWY2ZjE4OTM2MDQ2MGJhZWMyNDViMjJkOTc2NmZiEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiwaUtuFvCFYgAnyhlF-r75uXoEEkVJc5lmfnsMen0LdWR_tG0QfzZMHXjyt673XtrJstOJ9UXnXmhUPs6VnQhG3vA9B8zJefNhlDiDFAjjgzbI8TrM4SSOIMKgqkp05u4HXfeWNaSJvgZBj1tuSzA-IVXCGE4sJ-HbGEpIO-Z33s4SsutA4IrGUP6ltgNJItCZSN_qy1DdCCe9YJ2bMD6_jRdhVcDF_MqYfqIGq0t0ukHv3W4Jnsz3HAU",
  },
  {
    id: "9c71b130bad64c76b360a682b3a1d01e",
    title: "checkout",
    htmlUrl:
      "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQxNDk1ZmZiMmQwZDRlOWVhYmQzMjU0NWQzODkyYmFmEgsSBxDL5-uunwYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjM1MDM5MTUzOTU2MTQ3MjM5OQ&filename=&opi=89354086",
    screenshotUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiohWD8VChHVRlEfWDYsa00hJ7sacGd2fKe5uG4sAe9UdOaxPrNOBu5uZK1BmXH_QwSiTnx4A-5K7aPeWE-BmhoUAlxi-SG6ZkSdJmRvDMsc_g1zdXR9I5tRFE-NS7i2Cm7yVmRk3VajCI-mf_0vsAGFqgtZh45X3tO1qZ5-TfbWTexIRHWGvmNPATQIWSvfLGBr8iCVWQIFvM4O_hrT-VHpVc7bnI_T9176wx-VBQ3COF8ka29Vfl5tZg",
  },
];

async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

function curlDownload(url: string, outputPath: string) {
  execSync(
    `curl --http1.1 -L --fail --silent --show-error --retry 4 --retry-all-errors --retry-delay 2 -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' '${url}' -o '${outputPath}'`,
    {
      stdio: "inherit",
    },
  );
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

async function main() {
  const root = process.cwd();
  const rawDir = path.join(root, ".stitch", "raw");
  const htmlDir = path.join(rawDir, "html");
  const screenshotDir = path.join(rawDir, "screenshots");
  const assetDir = path.join(root, "public", "stitch-assets");

  await ensureDir(htmlDir);
  await ensureDir(screenshotDir);
  await ensureDir(assetDir);

  for (const screen of screens) {
    if (screen.htmlUrl) curlDownload(screen.htmlUrl, path.join(htmlDir, `${screen.title}.html`));
    if (screen.screenshotUrl) curlDownload(screen.screenshotUrl, path.join(screenshotDir, `${screen.title}.png`));
  }

  const discoveredAssets: Array<{ page: string; source: string; localPath: string }> = [];

  for (const screen of screens) {
    const htmlPath = path.join(htmlDir, `${screen.title}.html`);
    if (!existsSync(htmlPath)) continue;
    const html = await readFile(htmlPath, "utf8");
    const matches = unique(
      Array.from(html.matchAll(/https:\/\/lh3\.googleusercontent\.com\/aida-public\/[^"'\s)]+/g)).map(
        (match) => match[0],
      ),
    );

    let index = 1;
    for (const assetUrl of matches) {
      const localName = `${screen.title}-${String(index).padStart(2, "0")}.jpg`;
      const localPath = path.join(assetDir, localName);
      if (!existsSync(localPath)) {
        curlDownload(assetUrl, localPath);
      }
      discoveredAssets.push({
        page: screen.title,
        source: assetUrl,
        localPath: `/stitch-assets/${localName}`,
      });
      index += 1;
    }
  }

  await writeFile(
    path.join(root, ".stitch", "project.json"),
    JSON.stringify(
      {
        projectId,
        designSystem,
        screens: screens.map((screen) => ({
          id: screen.id,
          title: screen.title,
          htmlPath: `.stitch/raw/html/${screen.title}.html`,
          screenshotPath: `.stitch/raw/screenshots/${screen.title}.png`,
        })),
        extractedAssets: discoveredAssets,
      },
      null,
      2,
    ),
  );
  
  console.log("Successfully downloaded Stitch project and assets.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
