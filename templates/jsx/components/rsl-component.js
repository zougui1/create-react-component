import React from 'react';
import { connect } from 'react-redux';
import { mapDynamicState } from 'map-dynamic-state';

import '_componentToStyle_/_component_.scss';

const mapStateToProps = mapDynamicState('reducerName: prop');

const mapDispatchToProps = dispatch => ({

});

const _component_ = ({  }) => (
  <div className="_component_">
    <p>_component_ work!</p>
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(_component_);
