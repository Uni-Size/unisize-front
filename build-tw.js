import fs from "fs";

// tokens.json 파일 읽기
const tokens = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));

// 색상 토큰 추출 함수
function extractColors(colorData) {
  const colors = {};

  // 각 색상 그룹 처리
  Object.keys(colorData).forEach((colorGroup) => {
    const colorShades = colorData[colorGroup];
    const groupName = Object.keys(colorShades)[0]?.split("-")[0]; // 'red-100' -> 'red'

    if (!groupName) return;

    colors[groupName] = {};

    Object.keys(colorShades).forEach((shadeName) => {
      let shadeNumber = shadeName.split("-")[1]; // 'red-100' -> '100'

      // '050' -> '50'으로 변환
      if (shadeNumber === "050") {
        shadeNumber = "50";
      }

      const value = colorShades[shadeName].value;

      colors[groupName][shadeNumber] = value;
    });
  });

  return colors;
}

// light-color와 dark-color 추출
const lightColors = extractColors(
  tokens["global/color-token"]["light-color"]
);
const darkColors = extractColors(tokens["global/color-token"]["dark-color"]);

// Tailwind v4 CSS @theme 생성
function generateThemeColors(colors) {
  let theme = "";
  Object.keys(colors).forEach((colorName) => {
    Object.keys(colors[colorName]).forEach((shade) => {
      const value = colors[colorName][shade];
      theme += `    --color-${colorName}-${shade}: ${value};\n`;
    });
  });
  return theme;
}

const cssContent = `@import "tailwindcss";

@theme {
  /* Light mode colors */
${generateThemeColors(lightColors)}
}

/* Dark mode colors */
.dark {
${generateThemeColors(darkColors)}
}
`;

// globals.css 파일 쓰기
fs.writeFileSync("./src/app/globals.css", cssContent, "utf8");

console.log("✅ Tailwind v4 globals.css generated successfully!");
console.log("✅ Colors are now available as Tailwind classes!");
