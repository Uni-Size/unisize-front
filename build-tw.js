import fs from "fs";

// tokens.json 파일 읽기 (Style Dictionary가 생성한 파일)
const tokens = JSON.parse(fs.readFileSync("./token/tokens.json", "utf8"));

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

      const tokenValue = colorShades[shadeName];
      // Style Dictionary 형식에서 value 추출
      const value = tokenValue.value || tokenValue;

      colors[groupName][shadeNumber] = value;
    });
  });

  return colors;
}

// light-color와 dark-color 추출
const lightColors = extractColors(tokens["global/color-token"]["light-color"]);
const darkColors = extractColors(tokens["global/color-token"]["dark-color"]);

// 폰트 토큰 추출
function extractFontTokens(tokens) {
  let fontVars = "";

  // Font Families
  if (tokens.fontFamilies) {
    Object.keys(tokens.fontFamilies).forEach((key) => {
      const value = tokens.fontFamilies[key].value;
      fontVars += `    --font-family-${key}: ${value};\n`;
    });
  }

  // Font Sizes
  if (tokens.fontSize) {
    Object.keys(tokens.fontSize).forEach((key) => {
      const value = tokens.fontSize[key].value;
      fontVars += `    --font-size-${key}: ${value};\n`;
    });
  }

  // Font Weights
  if (tokens.fontWeights) {
    Object.keys(tokens.fontWeights).forEach((key) => {
      const value = tokens.fontWeights[key].value;
      fontVars += `    --font-weight-${key}: ${value};\n`;
    });
  }

  // Line Heights
  if (tokens.lineHeights) {
    Object.keys(tokens.lineHeights).forEach((key) => {
      const value = tokens.lineHeights[key].value;
      if (value !== "AUTO") {
        fontVars += `    --line-height-${key}: ${value};\n`;
      }
    });
  }

  // Letter Spacing
  if (tokens.letterSpacing) {
    Object.keys(tokens.letterSpacing).forEach((key) => {
      const value = tokens.letterSpacing[key].value;
      fontVars += `    --letter-spacing-${key}: ${value};\n`;
    });
  }

  return fontVars;
}

// Typography 유틸리티 클래스 생성
function generateTypographyClasses(tokens) {
  let classes = "";
  const typographyTokens = [
    "largeTitle",
    "Title1",
    "Title2",
    "Title3",
    "Body",
    "Headline",
    "SubheadLine",
    "Callout",
    "Caption1",
    "Caption2",
    "Footnote",
  ];

  typographyTokens.forEach((tokenName) => {
    if (tokens[tokenName] && tokens[tokenName].attributes) {
      const typography = tokens[tokenName].attributes.value;
      const description = tokens[tokenName].description || "";

      // 클래스 이름을 kebab-case로 변환 (largeTitle -> large-title, Title1 -> title-1)
      const className = tokenName
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();

      classes += `
/* ${description} */
.${className} {
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeight};
  font-size: ${typography.fontSize};
  line-height: ${typography.lineHeight !== "AUTO" ? typography.lineHeight : "normal"};
  letter-spacing: ${typography.letterSpacing};
}\n`;
    }
  });

  return classes;
}

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
@import "./custom-inputs.css";

@theme {
  /* Light mode colors */
${generateThemeColors(lightColors)}
  /* Font tokens */
${extractFontTokens(tokens)}
}

/* Dark mode colors */
.dark {
${generateThemeColors(darkColors)}
}

/* Typography utility classes */
${generateTypographyClasses(tokens)}
`;

// globals.css 파일 쓰기
fs.writeFileSync("./src/app/globals.css", cssContent, "utf8");

console.log("✅ Tailwind v4 globals.css generated successfully!");
console.log("✅ Typography classes generated successfully!");
console.log("✅ All design tokens are ready to use!");
