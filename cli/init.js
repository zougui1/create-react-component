const fs = require('fs');
const chalk = require('chalk');
const { initialization } = require('./utils');

module.exports = fullCommand => {
  const configPath = `${process.cwd()}/crc-config.json`;
  fs.exists(configPath, exists => {
    if(!exists) {
      fs.open(configPath, 'wx', err => {
        if(err) throw err;
        const config = initialization(fullCommand);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        console.log(chalk.rgb(17, 220, 67)('Create-react-component has been initialized, you can use "crc" to use it'));
      });
    }
  });
}
