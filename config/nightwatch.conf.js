
module.exports = {
  "src_folders": [
    "test/e2e"
  ],
  "output_folder": "./test/e2e/reports",
  "selenium": {
    "start_process": true,
    "server_path": "./bin/selenium.jar",
    "host": "127.0.0.1",
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver" : "./bin/chromedriver"
    }
  },
  "test_settings": {
    "default": {
      "globals": {
        "waitForConditionTimeout": 5000
      },
      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions": {
          "args": [
            "--no-sandbox"
          ]
        }
      }
    },
  }
};
