import * as React from 'react';
import { connect } from 'react-redux';
import { mapDynamicState } from 'map-dynamic-state';

import '_componentToStyle_/_component_.scss';

interface IProps {

};

type State = Readonly<{

}>;

const mapStateToProps = mapDynamicState('reducerName: prop');
const mapDispatchToProps = (dispatch: any) => ({

});

class _component_Component extends React.Component<IProps, State> {

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

export const _component_ = connect(mapStateToProps, mapDispatchToProps)(_component_Component);
