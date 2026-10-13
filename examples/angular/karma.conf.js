// Cấu hình Karma của dự án. Coverage chỉ xuất HTML và text-summary (không có json-summary).
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: { random: true },
      clearContext: false,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/shop-web'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress'],
    browsers: ['Chrome'],
    restartOnFileChange: true,
  });
};
