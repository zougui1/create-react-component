create-react-component is a CLI that create component for react

commands:
* -init: add an npm script with its path. e.g. `"crc": "node /path/to/the/cli"`, default config, the scripts are in jsx and there is no test, _2 args_
  * --tsx: pass the scripts type to tsx
  * --tests: make test file when creating a component
* help: show the list with all the available commands
* g: does a `git add .`, `git commit -m "message"`, `git push` in only 1 command
* c: create a stateless component
* sl: create a stateless component
* sf: create a stateful component
* rsl: create a redux stateless component (equal to "sl" if the scripts are in tsx)
* rsf: create a redux stateful component (equal to "sf" if the scripts are in tsx)

with a little "namespace" per component, each component have their divs with their name
so you can override their CSS without having to play with the CSS selectors

example of a stateless component

components/MyComponent.js
```jsx
import React from 'react'

import './MyComponent.scss';

const MyComponent = () => (
  <div className="MyComponent">
    <p>MyComponent work!</p>
  </div>
);

export default MyComponent;
```

styles/MyComponent.scss
```scss
.MyComponent {
  p {
    color: #000;
  }
}
```

the color of all the `<p></p>` inside  a div with a "MyComponent" class will be black, even if you have a global property set to another color

# project structure

## jsx
src =>
      components => MyComponent.js
      styles => MyComponent.scss

      tests => MyComponent.js (if tests are activated)

## tsx
src =>
      components => MyComponent.tsx
      styles => MyComponent.scss
      containers => MyComponent.tsx
      interfaces => MyComponent.tsx

      tests => MyComponent.tsx (if tests are activated)
