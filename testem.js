/* eslint-env node */
module.exports = {
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "reporter": "xunit",
  "xunit_intermediate_output": true,
  "report_file": "testlogs/results.xml",
  "launch_in_ci": [
    "Chrome"
  ],
  "launch_in_dev": [
    "Chrome"
  ]
};
