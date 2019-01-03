const fs = require('fs');
const chalk = require('chalk')
const structures = require('./structures');

const upperCaseFirst = string => {
  return string.charAt(0).toUpperCase() + string.substr(1);
}

exports.upperCaseFirst = upperCaseFirst;

const getPreviousDir = (path, noCurrentPath) => {
  let currentPath = process.cwd();
  currentPath = currentPath.replace(/\\/g, '/').toLowerCase();
  path = path.replace(/\\/g, '/').toLowerCase();
  const fullPath = new RegExp(currentPath).test(path) || noCurrentPath
    ? path
    : `${currentPath}/${path}`;
  const pathArr = fullPath.split('/');
  pathArr.pop();
  return pathArr.join('/');
}

exports.getPreviousDir = getPreviousDir

exports.pascalCasify = str => {
  let arr = str.split(/[_-]/g);
  arr = arr.map(str => upperCaseFirst(str));
  return arr.join('');
}

exports.getConfig = () => {
  const configPath = `${process.cwd()}/crc-config.json`;
  const exists = fs.existsSync(configPath);
  if(exists) return JSON.parse(fs.readFileSync(configPath));
}

exports.createFile = options => new Promise((resolve, reject) => {
  let { creationPath, readFilePath, componentName, config, filesPosition, fileType, configCLI } = options;
  const { mDS, structure } = config;
  const componentInFolder = new RegExp(`${componentName}/${componentName}`, 'i');
  // if the file is created in a folder that has the same name, we want the file to be named index
  creationPath = creationPath.replace(componentInFolder, `${componentName}/index`);
  const { parents } = filesPosition[fileType];
  // if in the object where the file is located contains more than 1 file, we add it an extension
  // otherwise it will throws an error because the file already exists
  if(
    parents.length > 0 &&
    howManyFile(structure, parents) > 1 &&
    fileType !== 'component' &&
    fileType !== 'style'
  ) creationPath = creationPath.replace('index', `index.${fileType}`);

  fs.open(creationPath, 'wx', err => {
    if(err) return reject(err);

    let content = readFilePath ? fs.readFileSync(readFilePath).toString() : ''; // get a string of the template
    content = content.replace(/_component_/g, componentName);
    if(configCLI.mDS === false || !mDS) content = content
      .replace(/import { mapDynamicState } from 'map-dynamic-state';/g, '')
      .replace(/mapDynamicState\('reducerName: prop'\);/, 'state => ({\n\n});\n');

    const regex = /(_.+To.+_)/gi;
    const matches = content.match(regex);
    if(Array.isArray(matches)) matches.forEach(match => {
      const [from, to] = match.split('_')[1].split(/To/i);
      content = findRelativePath(from.toLowerCase(), to.toLowerCase(), options, content);
    });

    fs.writeFileSync(creationPath, content, 'utf-8', err => { if(err) return reject(err) });
    resolve();
  })
});

const findRelativePath = (from, to, options, content) => {
  const { config, filesPosition, creationPath, componentName, fileType, configCLI } = options;
  const { structure, style } = config;
  const toFilePosition = filesPosition[to];
  const fromFilePosition = filesPosition[from];
  const { parents: toParents, folder: toFolder } = toFilePosition;
  const { parents: fromParents, folder: fromFolder } = fromFilePosition;
  let path = '';

  if((toParents.join('/') || toFolder) === (fromParents.join('/') || fromFolder)) path = './';
  else {
    // we want an array of the path after "src/"
    let creationRelativePath = creationPath.split('src/')[1];
    let _toParents = [...toParents || toFolder];
    let _fromParents = [...fromParents || fromFolder];
    let condition = true;
    while (condition) {
      let everythingSame = false; // true if both are in the same nested object
      _toParents.forEach((element, i) => everythingSame = element === _fromParents[i]);
      if(everythingSame) path = './';
      else {
        let creationRelativePathArr = getPreviousDir(creationRelativePath, true).split('/');
        for (let i = 0; i < creationRelativePathArr.length; i++) {
           path += '../';
        }
        let creationPathWithoutConfiguredStructure = getPreviousDir(creationRelativePath
          .split(_toParents[0])[0]
          .replace(fromParents.join('/') || fromFolder, toParents.join('/') || toFolder), true);
        path = `${path}${creationPathWithoutConfiguredStructure}`;
        if(_toParents.length > 0 && howManyFile(structures[configCLI.structure] || structure, _toParents) > 1) path += `/${componentName}`;
      }
      condition = false;
    }
  }
  content = content.replace(new RegExp(`_${from}To${to}_`, 'gi'), path);
  content = content.replace(new RegExp(`.//${componentName}`, 'g'), './index');
  content = content.replace(/\.scss/, `.${style}`);
  if(to !== 'component') {
    content = content.replace(/'\.\/'/, `'./index.${to}'`);
  } else if(fileType !== 'component' && fileType !== 'style') {
    const { parents } = filesPosition[fileType];
    if(parents.length > 0 && howManyFile(structures[configCLI.structure] || structure, parents) > 1) {
      content = content.replace(new RegExp(`/${componentName}`, 'i'), `/${componentName}/index.${fileType}`);
    }
  }
  return content;
}

const howManyFile = (structure, parents) => {
  const currentDir = structureNavigation(structure, parents);
  let fileNumber = 0;
  for(const key in currentDir) {
    // only strings are counted as file
    if(currentDir.hasOwnProperty(key) && typeof currentDir[key] === 'string') ++fileNumber;
  }
  return fileNumber;
}

const structureNavigation = (object, arr) => {
  if(arr.length === 0) return object;
  const newObj = object[arr[0]];
  let newArr = arr.slice();
  newArr.shift();
  return structureNavigation(newObj, newArr || []);
}

const getOptionValue = (command, wantedOption, defaultVal, trueIfExists) => {
  const option = new RegExp(`--${wantedOption}(=.)?`, 'i');
  let optionValue;
  if(option.test(command)) {
    if(trueIfExists) optionValue = true;
    command.split(' ').forEach(arg => {
      if(option.test(arg)) optionValue = arg.split('=')[1];
    });
  }
  if(defaultVal !== null && defaultVal !== undefined) optionValue = optionValue || defaultVal;
  if(typeof optionValue === 'string') optionValue = optionValue.toLowerCase();
  return optionValue;
}

const getConfigFromCommand = command => {
  const scriptsType = getOptionValue(command, 'tsx', null, true) && 'tsx';
  const tests = getOptionValue(command, 'tests', null, true);
  const mDS = getOptionValue(command, 'MDS', null, true);
  const style = getOptionValue(command, 'style', null);
  const defaultFiles = getOptionValue(command, 'defaultFiles', null, true);
  const choosenStructure = getOptionValue(command, 'structure');
  const structure = structures[choosenStructure];
  const config = {};

  if(scriptsType) config.scriptsType = scriptsType;
  // the value can be a string, so we parse it to get either true or false, or string if the value is wrong
  // but we only want a boolean
  if(typeof tests === 'string' && typeof JSON.parse(tests) === 'boolean') config.tests = JSON.parse(tests);
  if(typeof mDS === 'string' && typeof JSON.parse(mDS) === 'boolean') config.mDS = JSON.parse(mDS);
  if(defaultFiles === 'false' || defaultFiles === 'true') config.defaultFiles = JSON.parse(defaultFiles);
  if(style) config.style = style;
  if(structure) config.structure = structure;

  return config;
}

const initialization = command => {
  const config = getConfigFromCommand(command);
  config.scriptsType = config.scriptsType || 'jsx';
  if(config.tests === undefined) config.tests = false;
  config.style = config.style || 'scss';
  if(config.defaultFiles === undefined) config.defaultFiles = true;
  config.structure = config.structure || structures.separation;
  return config;
}

exports.getOptionValue = getOptionValue;
exports.getConfigFromCommand = getConfigFromCommand;
exports.initialization = initialization;
