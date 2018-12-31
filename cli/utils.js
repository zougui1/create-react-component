const fs = require('fs');
const chalk = require('chalk')

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

exports.isConfigValid = (config, reject) => {
  if(config.constructor.name !== 'Object') reject('The CLI must be initialized');
  else if(
    !config.scriptsType ||
    !/(j|t)sx/.test(config.scriptsType) ||
    (config.tests === undefined || config.tests === null) ||
    config.tests.constructor.name !== 'Boolean'
  ) {
    console.log(error('The config is wrong, it must contains:'));
    console.log(error('scriptsType: "tsx" OR "jsx"'));
    console.log(error('tests: true OR false'));
    reject();
  }
}

exports.createFile = options => new Promise((resolve, reject) => {
  let { creationPath, readFilePath, componentName, mDS, structure, filesPosition, fileType } = options;
  const componentInFolder = new RegExp(`${componentName}/${componentName}`, 'i');
  creationPath = creationPath.replace(componentInFolder, `${componentName}/index`);
  const { parents } = filesPosition[fileType];
  if(parents.length > 0 && Object.keys(structureNavigation(structure, parents)).length > 1) {
    if(fileType !== 'component' && fileType !== 'style') {
      creationPath = creationPath.replace('index', `index.${fileType}`);
    }
  }
  fs.open(creationPath, 'wx', err => {
    if(err) return reject(err);

    let content = fs.readFileSync(readFilePath).toString();
    content = content.replace(/_component_/g, componentName);
    if(!mDS) content = content
      .replace(/import { mapDynamicState } from 'map-dynamic-state';/g, '')
      .replace(/mapDynamicState\('reducerName: prop'\);/, 'state => ({\n\n});\n');

    content = findRelativePath('component', 'interface', options, content);
    content = findRelativePath('component', 'style', options, content);
    content = findRelativePath('test', 'component', options, content);
    content = findRelativePath('container', 'component', options, content);

    fs.writeFileSync(creationPath, content, 'utf-8', err => { if(err) return reject(err) });
    resolve();
  })
});

const findRelativePath = (from, to, options, content) => {
  const { structure, filesPosition, creationPath, componentName, style, fileType } = options;
  const toFilePosition = filesPosition[to];
  const fromFilePosition = filesPosition[from];
  const { parents: toParents, folder: toFolder } = toFilePosition;
  const { parents: fromParents, folder: fromFolder } = fromFilePosition;
  let path = '';

  if((toParents.join('/') || toFolder) === (fromParents.join('/') || fromFolder)) {
    path = './';
  } else {
    let creationRelativePath = creationPath.split('src/')[1];
    let _toParents = [...toParents];
    let _fromParents = [...fromParents];
    let condition = true;
    while (condition) {
      let everythingSame = false;
      _toParents.forEach((element, i) => everythingSame = element === _fromParents[i]);
      if(everythingSame) {
        condition = false;
        path = './';
      } else {
        let creationRelativePathArr = getPreviousDir(creationRelativePath, true).split('/');
        for (let i = 0; i < creationRelativePathArr.length; i++) {
          if(creationRelativePathArr[i] !== _toParents[i]) path += '../';
        }
        let creationPathWithoutConfiguredStructure = getPreviousDir(creationRelativePath
          .split(_toParents[0])[0]
          .replace(fromParents.join('/') || fromFolder, toParents.join('/') || toFolder), true);
        path = `${path}${creationPathWithoutConfiguredStructure}`;
        if(Object.keys(structureNavigation(structure, _toParents)).length > 1) path += `/${componentName}`;
        condition = false;
      }
    }
  }
  content = content.replace(new RegExp(`_${from}To${to}_`, 'gi'), path);
  content = content.replace(new RegExp(`.//${componentName}`, 'g'), './index');
  content = content.replace(/\.scss/, `.${style}`);
  if(to === 'interface') {
    content = content.replace(/'\.\/'/, '\'./index.interface\'');
  } else if(fileType !== 'component' && fileType !== 'style') {
    const { parents } = filesPosition[fileType];
    if(parents.length > 0 && Object.keys(structureNavigation(structure, parents)).length > 1) {
      content = content.replace(new RegExp(`/${componentName}`, 'i'), `/${componentName}/index.${fileType}`);
    }
  }
  return content;
}

const structureNavigation = (object, arr) => {
  if(arr.length === 0) return object;
  const newObj = object[arr[0]];
  let newArr = arr.slice();
  newArr.shift();
  return structureNavigation(newObj, newArr || []);
}
