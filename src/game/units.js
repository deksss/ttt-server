import {Map} from 'immutable';

export function initUnits (unitsListSrc) {
  return unitsListSrc.map(function (src) {
    return Map(require(src));
  });
}

export function addUnitToList (state, src) {
  const unit = Map(require(src));
  if (unit && unit.id) {
    return state.setIn(['units', unit.id], unit);
  } else {
  	return state;
  }
};

export function getUnitById (state, unitId) {
  return state.get('units').get(unitId);
}
