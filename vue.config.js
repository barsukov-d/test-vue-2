const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        api: "modern-compiler",
        sassOptions: {
          quietDeps: true,
          verbose: false,
          silenceDeprecations: [
            "legacy-js-api",
            "import",
            "global-builtin",
            "color-functions",
          ],
        },
      },
      scss: {
        api: "modern-compiler",
        sassOptions: {
          quietDeps: true,
          verbose: false,
          silenceDeprecations: [
            "legacy-js-api",
            "import",
            "global-builtin",
            "color-functions",
          ],
        },
      },
    },
  },
});
