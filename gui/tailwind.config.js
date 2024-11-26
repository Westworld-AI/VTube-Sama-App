const {nextui} = require("@nextui-org/react");


module.exports = {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [nextui()]
};

