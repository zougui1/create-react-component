import * as React from 'react';

import { IProps, State } from '_componentToInterface_';
import '_componentToStyle_/_component_.scss';

export class _component_ extends React.Component<IProps, State> {

  public readonly state: State = {

  }

  public render() {
    return (
      <div className="_component_">
        <p>_component_ work!</p>
      </div>
    )
  }
}
