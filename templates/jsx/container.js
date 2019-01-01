import { connect } from 'react-redux';
import { mapDynamicState } from 'map-dynamic-state';
import _component_ from '_containerToComponent_';

const mapStateToProps = mapDynamicState('reducerName: prop');
const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(_component_);
