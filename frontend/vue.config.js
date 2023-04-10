process.env.VUE_APP_VERSION = require('./package.json').version
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
