//평탄화 build-ts.js

import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import fs from "fs";

// 토큰 파일을 읽어서 평탄화
const rawTokens = JSON.parse(
  fs.readFileSync("./token/origin-figma-token.json", "utf8")
);

// 토큰 평탄화: font-token의 내용을 최상위로 이동
const flattenedTokens = {
  ...rawTokens,
};

// font-token 내부의 토큰들을 최상위로 복사
if (rawTokens["font-token"]) {
  Object.keys(rawTokens["font-token"]).forEach((key) => {
    if (!flattenedTokens[key]) {
      flattenedTokens[key] = rawTokens["font-token"][key];
    }
  });
}

// 임시 평탄화된 토큰 파일 생성
fs.writeFileSync(
  "./token/flattened-token.json",
  JSON.stringify(flattenedTokens, null, 2)
);

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ["./token/flattened-token.json"], // 평탄화된 토큰 사용
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      buildPath: "token/",
      files: [
        {
          destination: "tokens.json",
          format: "json",
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
