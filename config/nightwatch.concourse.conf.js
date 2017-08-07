
module.exports = {
  "src_folders": [
    "test/e2e"
  ],
  "output_folder": "./test/e2e/reports",
  "test_settings": {
    "default": {
      "silent": true,
      "selenium_port": 4444,
      "selenium_host": "localhost",
      "globals": {
        "waitForConditionTimeout": 5000
      },
      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions": {
          "args": [
            "--no-sandbox",
            "headless",
            "disable-gpu"
          ]
        }
      }
    },
  }
};
