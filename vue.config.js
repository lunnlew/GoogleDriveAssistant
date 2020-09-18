const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    plugins: [],
    entry: path.join(__dirname, 'src/renderer/main.js'),
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/renderer'),
        'vue$': 'vue/dist/vue.esm.js'
      },
      extensions: ['.js', '.vue', '.json', '.css']
    }
  },
  chainWebpack: config => {
    return config
  },
  pluginOptions: {
    electronBuilder: {
      externals: [],
      // nodeIntegration: true,
      builderOptions: {
        win: {
          "target": [{
            "target": "nsis",
            "arch": [
              "ia32"
            ]
          }],
          // requestedExecutionLevel: 'requireAdministrator',
          "rfc3161TimeStampServer": "http://tsa.startssl.com/rfc3161",
          "signDlls": true,
          icon: './public/app.png'
        },
        mac: {
          "extendInfo": {
            "URL types": [{
              "URL identifier": "google-store-transfer",
              "URL Schemes": [
                "google-store-transfer"
              ]
            }]
          },
          icon: './public/app.png'
        },
        "productName": "GoogleDrive助手",
        "extraResources": [],
        "nsis": {
          "oneClick": false,
          "allowElevation": true,
          "allowToChangeInstallationDirectory": true,
          "createDesktopShortcut": true
        },
      },
      outputDir: 'dist_electron',
      chainWebpackMainProcess: config => {
        // config.plugin('define').tap(args => {
        //   args[0]['HTTPS_PROXY'] = "http://127.0.0.1:1080"
        //   args[0]['HTTP_PROXY'] = "http://127.0.0.1:1080"
        //   return args
        // })
        if (process.env.NODE_ENV === 'production') {
          config.plugin('define').tap(args => {
            args[0]['NODE_ENV'] = "production"
            return args
          })
        }
      },
      chainWebpackRendererProcess: config => {
        config.plugin('define').tap(args => {
          args[0]['IS_ELECTRON_RENDERER'] = true
          return args
        })
      },
      mainProcessFile: 'src/background.js',
      mainProcessWatch: ['src']
    }
  }
}
