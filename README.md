# Create-react-component
create-react-component is a CLI that create component files

## Installation
```
$ npm install -g create-react-component
```

## commands
commands:
* init: add an npm script with its path. e.g. `"crc": "node /path/to/the/cli"`, default config: the scripts are in jsx, the styles in scss, there is no test and the structure is "separation", _4 args_
* sl: create a stateless component
* sf: create a stateful component
* rsl: create a redux stateless component
* rsf: create a redux stateful component

flags:
* --tsx: pass the scripts type to tsx, default: false (jsx)
* --tests: make test file when creating a component, default: false
* --style: choose a style extension, default: scss
* --structure: choose a structure over the pre-defined ones, default: separation
* --defaultFiles: set if the default files must be created or no, default: true

some examples:
initiate the CLI with tests, with tsx files, default structure ("separation") and without the defaultFiles
`crc init --tests --tsx --defaultFiles=false`

create a stateless component without any test using the "strictseparation" structure
`crc sl test --tests=false --structure=strictseparation`


## pre-defined structures

### separation
```
src
  components
    MyComponent
      index.js => component
      index.container.js => if redux component
      index.scss
      index.test.js => if tests are activated
```

### condensed
```
src
  components
    MyComponent
      index.js => the component and the container in the same file (if redux component)
      index.scss
      index.test.js => if tests are activated
```

### strictseparation
```
src
  components
    MyComponent.js
  containers
    MyComponent.js => if redux component
  styles
    MyComponent.scss
  tests
    MyComponent.test.js => if tests are activated
```

## custom structure

you can make your own structure by editing the existing one in `crc-config.json`
for example, this:
```json
{
  "structure": {
    "components": {
      "component": ["component", "container"],
      "style": "style",
      "interface": "interface"
    },
    "tests": {
      "some": {
        "folder": {
          "test": "test"
        }
      }
    }
  }
}
```
will results by this
```
src
  components
    MyComponent
      index.js => component, contains the component and the container in the same file
      index.scss
  tests
    some
      folder
        MyComponent
          index.test.js => if tests are activated
```
> note: "component", "container", "style", "interface" and "test" are all **required**

## custom file creation

You can add files that will be created when create a component and add them into the structure like so:

```json
{
  "customFiles": ["newFile", "something"],
  "structure": {
    "components": {
      "component": ["component", "container"],
      "interface": "interface",
      "style": "style",
      "test": "test",
      "newFile": "newFile",
      "something": "something"
    }
  }
}
```
will results with:
```
src
  components
    MyComponent
      index.js => the component and the container in the same file (if redux component)
      index.scss
      index.test.js => if tests are activated
      index.newFile.js
      index.something.js
```

> note: once a file is added in `customFiles` it is **required** in the structure, the files has a sub-extension *only* if they are in a folder that contains more than 1 file

## custom template

You can add a file to be created, but it doesn't have a template, that's why you can also create your own template, and can also use your own template for the pre-defined files (e.g. "component", "style", etc...)
just like so:
```json
{
  "templates": {
      "container": "./customTemplates/container.js",
      "style": "./customTemplates/style.css",
      "newFile": "./customTemplates/newFile.ts",
      "something": "./customTemplates/something.js"
  }
}
```
now all the files "container", "style", "newFile", "something" will have their own custom template
if *all* your templates are in a common folder, you can add a templates path like so:
```json
{
  "templatesPath": "./customTemplates",
  "templates": {
      "container": "./container.js",
      "style": "./style.css",
      "newFile": "./newFile.ts",
      "something": "./subFolder/something.js"
  }
}
```
> note: the templates extension will not influence the created files extension

### get the component's name and a path to another file
now, there are a few things to know about the templates, what if your generated files need a path to another file, and what if it need the component's name?

you can use some keywords to do it!

#### get the component's name
if you need to get the component's name inside the files that will be created you can use \_component\_, like so:

template:
```jsx
import React from 'react';

const _component_ = () => (
  <p>_component_ work!</p>
);

export default _component_;
```
will results by this:
```jsx
import React from 'react';

const MyComponent = () => (
  <p>MyComponent work!</p>
);

export default MyComponent;
```

#### get the path to another file
now you want to get the path to another path? you just have to use \_fileToAnotherFile\_
when "file" will be a file-type (e.g. "component", "style", "container", "customFile", etc...)
"To" is **required**
and "AnotherFile" is exactly the same as "file"

for example, if you want to get path in the file "component" to "customFile" you will need to use \_componentToCustomFile\_ like so:

templates:

component:
```jsx
import React from 'react';
import { someFunction } from '_componentToCustomFile_';

const _component_ = () => (
  <p>{someFunction()}</p>
);

export default _component_;
```
customFile:
```jsx
export const someFunction = () => _component_ work!;
```

will results by:

component:
```jsx
import React from 'react';
import { someFunction } from './path/from/MyComponent/to/customFile';

const MyComponent = () => (
  <p>{someFunction()}</p>
);

export default MyComponent;
```
customFile:
```jsx
export const someFunction = () => MyComponent work!;
```

## full custom template

If you do **not** want the default required files (e.g. "component", "style", "test", "container", "interface") you can add "fullCustom" to the config file, with either true or an array of the wanted files, customFiles still work, just not the default ones, so this config work:
```json
{
  "scriptsType": "tsx",
  "tests": false,
  "style": "scss",
  "defaultFiles": false,
  "customFiles": ["component", "something"],
  "structure": {
    "components": {
      "component": "component",
      "something": "something"
    }
  }
}
```

You can also add your own extension to the file you want to be created, just like so:
```json
{
  "customFiles": ["server.php"],
  "structure": {
    "components": {
      "component": ["component", "container"],
      "interface": "interface",
      "style": "style",
      "test": "test",
      "server": "server.php"
    }
  }
}
```
Will results by:
```
src
  components
    MyComponent
      index.js => the component and the container in the same file (if redux component)
      index.scss
      index.test.js => if tests are activated
      index.server.php
```

You can also set `defaultFiles` to false and do not create any JS file.

## examples

no test, jsx file (js extension), style in scss, using "separation" structure
```json
{
  "scriptsType": "jsx",
  "tests": false,
  "style": "scss",
  "defaultFiles": true,
  "structure": {
    "components": {
      "component": "component",
      "container": "container",
      "interface": "interface",
      "style": "style",
      "test": "test"
    }
  }
}
```
will results by:
```
src
  components
    MyComponent
      index.js
      index.container.js
      index.interface.js
      index.scss
```

full custom config, with custom templates except for the styles
```json
{
  "scriptsType": "jsx",
  "tests": true,
  "style": "less",
  "defaultFiles": false,
  "customFiles": ["test", "style", "something.php", "somethingElse.coffee"],
  "templatesPath": "./templates",
  "templates": {
    "test": "./test.js",
    "something.php": "./something.php",
    "somethingElse.coffee": "./somethingElse.coffee"
  },
  "structure": {
    "components": {
      "something": "something.php",
      "somethingElse": "somethingElse.coffee",
      "style": "style"
    },
    "tests": "test"
  }
}
```
will results by:
```
src
  components
    MyComponent
      index.something.php
      index.somethingElse.coffee
      index.less
  tests
    MyComponent
      index.test.js
```
