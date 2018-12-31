import * as React from 'react';
import { connect } from 'react-redux';
import { mapDynamicState } from 'map-dynamic-state';
import { IProps } from '_componentToInterface_';

import '_componentToStyle_/_component_.scss';

const mapStateToProps = mapDynamicState('reducerName: prop');

const mapDispatchToProps = (dispatch: any) => ({

});

const _component_Component: React.SFC<IProps>= ({  }) => (
  <div className="_component_">
    <p>_component_ work!</p>
  </div>
);

export const _component_ = connect(mapStateToProps, mapDispatchToProps)(_component_Component);
