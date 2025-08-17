// Web Test Runner configuration file

module.exports = {
  testRunner: 'mocha',
  browsers: ['chrome'],
  files: ['src/app/**/*.spec.ts'],
  plugins: [
    require('@web/test-runner-angular')({
      angularConfig: {
        testBed: {
          imports: [
            require('@angular/router/testing').RouterTestingModule
          ]
        }
      }
    })
  ],
  coverage: true,
  coverageConfig: {
    thresholds: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
};
