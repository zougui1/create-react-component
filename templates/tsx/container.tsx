import { connect, MapStateToPropsParam } from 'react-redux';
import { mapDynamicState } from 'map-dynamic-state';
import { _component_ as _component_Component } from '_containerToComponent_';

const mapStateToProps: MapStateToPropsParam<{}, {}, {}> = mapDynamicState('reducerName: prop');
const mapDispatchToProps = (dispatch: any) => ({

});

export const _component_ = connect(mapStateToProps, mapDispatchToProps)(_component_Component);
