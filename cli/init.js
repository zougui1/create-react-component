const fs = require('fs');
const chalk = require('chalk');
const structures = require('./structures');

module.exports = fullCommand => {
  const configPath = `${process.cwd()}/crc-config.json`;
  fs.exists(configPath, exists => {
    if(!exists) {
      const scriptsType = /--tsx(=true)?/i.test(fullCommand)
        ? 'tsx'
        : 'jsx';
      const useTests = /--tests(=true)?/i.test(fullCommand);
      let style = /--style(=.)/i.test(fullCommand);
      if(style) fullCommand.split(' ').forEach(arg => style = /--style/i.test(arg) && arg.split('=')[1].toLowerCase());
      else style = 'scss';

      let structure = /--structure(=.)/i.test(fullCommand);
      if(structure) fullCommand.split(' ').forEach(arg => structure = /--structure/i.test(arg) && arg.split('=')[1].toLowerCase());
      if(/strict(-)?separation/i.test(structure)) structure = structures.strictSeparation;
      else if(/separation/i.test(structure)) structure = structures.separation;
      else if(/condensed/i.test(structure)) structure = structures.condensed;
      else structure = structures.separation;

      fs.open(configPath, 'wx', err => {
        if(err) throw err;
        const data = {
          scriptsType,
          style,
          tests: useTests,
        };
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(chalk.rgb(17, 220, 67)('Create-react-component has been initialized, you can use "crc" to use it'));
      });
    }
  });
}
