import {Map, List} from 'immutable';
import {shuffleArray} from '../utils';

function strDirect2Cord (cell, direct) {
  const DIRECTIOINS =
    {'UL': {x:-1, y: -1},
	 'U': {x: 0, y: -1},
	 'UR':{x: 1, y: -1},
	 'L': {x: -1, y: 0},
	 'R': {x: 1, y: 0},
	 'DL':{x:-1, y: 1},
	 'D': {x: 0, y: 1},
	 'DR':{x: 1, y: 1}};

  return {x: Number(DIRECTIOINS[direct].x) + Number(cell.get('x')),
  	      y: Number(DIRECTIOINS[direct].y) + Number(cell.get('y'))
  	    };
}

function chekDied (cell) {
	if (cell.get('unit') &&
		  cell.getIn(['unit', 'hp']) < 1) {
		return true;
	} else {
		return false;
	}
}

function normalizeDirects (cell, field) {
	const resultCell = cell.getIn(['unit', 'direction']).map(direct => {
    const cord = strDirect2Cord(cell, direct);
    const correct = field.find(val => {
	    if (val.get('y') == cord.y && val.get('x') == cord.x) {
	      return true;
	    } else  {
	      return false;
	    }
	  });

	  if (correct && (correct.get('index') === 0 || correct.get('index'))) {
	   return Map({index: correct.get('index'),
	  	           x: cord.x,
	  	           y: cord.y,
	  	           direct: direct});
	  }
  });

  return resultCell.filter(val => val);
}

function getCellTargets (field, cell, directs) {
  return List(directs.filter(direct => {
  	let targetCell = false;
		if (field.get(direct.get('index')) || field.get(direct.get('index')) === 0) {
		  targetCell = field.get(direct.get('index'));
		};
	  if (targetCell &&
		    targetCell.get('owner') !== '' &&
		    targetCell.get('owner') !== cell.get('owner')) {
	    return true;
	  }  else {
	    return false;
	  }
  }));
}

function getTargetForAtk (field, cell) {
  const directs = normalizeDirects(cell, field);
  const onlyLiveEnemy =  getCellTargets(field, cell, directs);
  if (onlyLiveEnemy && onlyLiveEnemy.count() > 0) {
	  return shuffleArray(onlyLiveEnemy.toArray())[0];
	} else {
	  return false;
  }
}

function isCellCanAtak (cell) {
 if (cell.get('unit') &&
		cell.getIn(['unit', 'atk']) &&
		cell.getIn(['unit', 'ready'])  &&
		cell.getIn(['unit', 'direction']) &&
		cell.get('owner') !== '') {
 	return true;
 } else {
 	return false;
 }
}

function calcTargetDmg (cellAtk) {
  const dmg = cellAtk.reduce(function(prev, currentValue) {
		 return prev.set('dmg', prev.get('dmg' ) + currentValue.get('dmg'));
	});

	return dmg.get('dmg');
}

function callOneCellHp (feild, ataksAction, cell) {
  var cellAtk;
  const index = cell.get('index');
  if (cell.get('unit') && cell.getIn(['unit', 'hp'])) {
    cellAtk = ataksAction.filter(function (action) {
	  if(action.get('targetIndex') == index)  {
	    return true;
	  } else {
		return false;
	  }
	});
  }
  if (cellAtk && cellAtk.count() > 0) {
  	const newHP = cell.getIn(['unit', 'hp']) - calcTargetDmg(cellAtk);
    const cellResult =  cell.setIn(['unit', 'hp'],  newHP);
    return cellResult.set('died', chekDied(cellResult));
  } else {
  	return cell.set('died', chekDied(cell));
  }
}

export function calcHp (state) {
	const ataksAction = state.get('ataksAction');
	const oldField = state.get('field');
	const newField = oldField.map(function (cell) {
    return callOneCellHp(oldField, ataksAction, cell);
	});

	return state.set('prevField', state.getIn( 'field'))
	            .set('field', List(newField));
}

function healCell (cell, addHp) {
	const maxHp = cell.getIn(['unit', 'maxHp']);
	let newHp = cell.getIn(['unit', 'hp']) + addHp;
	if (newHp > maxHp) {
    newHp = maxHp;
	}
	return cell.setIn(['unit', 'hp'], newHp);
}

function findNotFullHpAllys (field, cellOwner) {
	return field.filter(cell => cell.get('owner') === cellOwner &&
    cell.getIn(['unit', 'hp']) < cell.getIn(['unit', 'maxHp']));
}

function healOneFriend (state, cell, params) {
	const targetIds =
	  findNotFullHpAllys(state.get('field'), cell.get('owner'));
    console.log('targetIds ' + targetIds);
  if (targetIds && targetIds.count() > 0) {
  	let target = targetIds.get(0);
    return state.setIn(['field', target.get('index')],
    	                 healCell(target, params.hp));
  } else {
   return state;
  }
}

const onTurnContainer = {};
onTurnContainer.healOneFriend = healOneFriend;

function onTurnFireAll (state, onTurnActions) {
	const curAction = onTurnActions.last();
  const func = onTurnContainer[curAction.funcName];
	const newState = func(state, curAction.cell, curAction.params) || state;
  if ((onTurnActions.count() - 1) > 0) {
  	return onTurnFireAll(newState, onTurnActions.pop());
  } else {
  	return newState;
  }
}

export function onTurn (state) {
	const onTurnActions = state.get('field')
	                   .filter(cell => cell.getIn(['unit' ,'onTurn'])
                                  && cell.getIn(['unit' ,'onTurn']).funcName)
	                   .map(cell => {
	                   	  let action = {};
	                      action.funcName = cell.getIn(['unit' ,'onTurn']).funcName;
	                      action.params = cell.getIn(['unit' ,'onTurn']).params;
                        action.cell = cell;
                        return action;
	                   }) || List([]);
  console.log('onTurnActions ' + onTurnActions);
	if (onTurnActions.count() > 0) {
		return onTurnFireAll(state, onTurnActions);
	} else {
		return state;
	}
}

export function setAtk (state) {
  const field = state.get('field');
  const cellAtakers = field.filter(isCellCanAtak);
  const ataksAction = cellAtakers.map(function (cell) {
		  const target = getTargetForAtk(field, cell);
			if (target === 0 || target) {
		    return Map({targetIndex: target.get('index'),
					         atakerIndex: cell.get('index'),
					         dmg: cell.getIn(['unit', 'atk']),
								   direct: target.get('direct')});
		  } else {
		    return false;
		  }
	});
	return state.set('ataksAction',
		               List(ataksAction).filter(val => val !== false));
}
