//평탄화 build-ts.js

import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ["./token/origin-figma-token.json"], // Tokens Studio 에서 추출한 토큰
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio", // <-- apply the tokens-studio transformGroup to apply all transforms
      transforms: ["name/kebab"], // 만들어질 token 이름 형태, 기본값 camel
      buildPath: "", // 생성될 파일 경로
      files: [
        {
          destination: "tokens.json", // 반환될 토큰 파일 이름
          format: "json",
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
