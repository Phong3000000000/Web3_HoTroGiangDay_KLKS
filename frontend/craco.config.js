module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // Fix the allowedHosts issue
    devServerConfig.allowedHosts = 'all';
    return devServerConfig;
  },
};
