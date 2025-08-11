const config = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},

    'postcss-pxtorem': {
      rootValue: 200,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 0,
      exclude: /node_modules/i,
    },
  },
};

export default config;
