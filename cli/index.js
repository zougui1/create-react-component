const commander = require('commander');
const chalk = require('chalk');
const createComponents = require('./createComponent');
const init = require('./init');
const { getConfig } = require('./utils');
const error = chalk.rgb(205, 21, 30);
const success = chalk.rgb(17, 220, 67);
const packageJson = require('../package.json');

// list of all the component types
const componentList = ['sl', 'sf', 'rsl', 'rsf'];

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<action> [name]')
  .usage(`${success('<action>')} [name] [options]`)
  .action(cmd => command = cmd)
  .option('t', 'test')
  .option('init', 'initialize the command line tool')
  .option('sl', 'create a stateless component')
  .option('sf', 'create a stateful component')
  .option('rsl', 'create a redux stateless component')
  .option('rsf', 'create a redux stateful component')
  .option('init', 'initialize the CLI tool')
  .option('--MDS', 'use the library map-dynamic-state')
  .option('--tsx', 'set the scripts to tsx')
  .option('--tests', 'create testing file')
  .option('--structure', 'set the components structure')
  .allowUnknownOption()
  .parse(process.argv);
// commander simplify the use of the arguments

if(!program.init && !getConfig()) { // the config is required to run any command
  console.log(error('You must initialize the CLI tool before using it. "crc init [options]"'));
  process.exit(0);
}

const actions = () => new Promise((resolve, reject) => {
  const component = getComponent();
  let rawArgs = [...program.rawArgs];
  rawArgs.shift();
  rawArgs.shift();
  const command = rawArgs.join(' ');
  if(program.t) resolve();
  // we need to find the full command, but the 2 first values in the array are not from the user

  if(component) createComponents(component).then(resolve).catch(reject);
  else if(program.init) init(command);
  else {
    reject(`"${command}" is not a valid command.`);
  }
});

const getComponent = () => {
  let command = {};
  componentList.forEach(component => {
    if(program[component]) command = { type: component, name: program.args[0] };
  });
  if(Object.keys(command).length === 0) return;
  return command;
}

actions()
  .then(() => console.log(success('The component has been created')))
  .catch(err => {
    displayErrors(err);
    console.log(error('Use "crc --help" if you need help.'));
  });


const displayErrors = errors => {
  if(Array.isArray(errors)) {
    errors.forEach(err => {
      if(Array.isArray(err)) mapErrors(err);
      else console.log(error(err));
    });
  }
  else console.log(error(errors));
}
