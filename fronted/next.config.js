/** @type {import("next").NextConfig} */
module.exports = {
    experimental: { appDir: true },
    webpack(config) {
      config.experiments = { ...config.experiments, topLevelAwait: true }
      return config
    },
    images: {
      domains: ['i.postimg.cc', 'pbs.twimg.com',"pbs.twimg.com"],
    },    
}