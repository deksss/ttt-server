import {Map, List} from 'immutable';
import {shuffleArray} from '../utils';

export function genereateNewFied () {
	const gameFieldId = ['00', '01', '02', '10', '11', '12', '20', '21', '22'].map(
		function (value, index) {
			return Map({index: index,
				          id: value,
									x: value[1],
									y: value[0],
									free: true,
									owner: ''});
});
	return List(gameFieldId);
}


export function setCard(state, roomId, playerNumber, cellId) {
	const playerData = state.get(roomId).get('players').get(playerNumber);
	const selectedCard = playerData.get('selectedCard') || false;
	const cell = state.get(roomId)
	                  .get('field')
	                  .find(value => value.get('id') === cellId) || false;
	const cellIndex = cell.get('index');
	const delIndx = selectedCard.get('id');
	if (cell.get('free') && selectedCard && playerData.get('canSetCards')) {
		return state.setIn([roomId, 'field', cellIndex, 'unit'], selectedCard.get('unit'))
		            .setIn([roomId, 'field', cellIndex, 'owner'], playerNumber)
		            .setIn([roomId, 'field', cellIndex, 'free'], false)
		            .setIn([roomId, 'players', playerNumber, 'selectedCard'], null)
		            .setIn([roomId, 'players', playerNumber, 'canSetCards'], false)
		            .setIn([roomId, 'players', playerNumber, 'hand', delIndx, 'unit'], null);
	} else {
		return state;
	}
}

function clearDeathCards (state, roomId) {
	return state.setIn([roomId, 'field'], 
		               state.getIn([roomId, 'field']).map(function (cell) {
		                 if (cell.get('died')) {
			               return cell.set('died', false)
			                          .set('free', true)
			                          .set('owner', '')
					                  .set('unit', false);
		                 } else {
			               return cell;
		                 }
	             }))
	            .setIn([roomId, 'ataksAction'], List([]));
}

function normalizeDirects (cell, field) {
  const DIRECTIOINS = {'UL': {x:-1, y: -1}, 
	  'U': {x: 0, y: -1}, 
	  'UR': {x: 1, y: -1},
	  'L':  {x: -1, y: 0}, 
	  'R': {x: 1, y: 0},
	  'DL': {x:-1, y: 1}, 
	  'D': {x: 0, y: 1}, 
	  'DR': {x: 1, y: 1}};

  return cell.getIn(['unit', 'direction']).map(direct => {
		const x = Number(DIRECTIOINS[direct].x) + Number(cell.get('x'));
		const y = Number(DIRECTIOINS[direct].y) + Number(cell.get('y'));
		console.log('x: '+ x);
        console.log('y: '+ y);
		const correct = field.find(val => {
			if (val.get('y') == y && val.get('x') == x) {
				return true;
			} else  {
				return false;
			}
		  });
		if (correct && correct.get('index')) {
		  return Map({index: correct.get('index'), x: x, y: y});
		}
	}).filter(val => val);
}

function getTargetForAtk (field, cell) {
  const directs = normalizeDirects(cell, field);
  console.log('norm directs:'+directs);
  const onlyLiveEnemy =  List(directs.filter(direct => {
    const targetCell = field.get(direct.get('index')) || false;
	if (targetCell !== false && 
		targetCell.get('owner') !== '' && 
		targetCell.get('owner') !== cell.get('owner')) {
	  return true;
	}  else {
	  return false;
	}
  }));
  console.log('onlyLiveEnemy:'+onlyLiveEnemy);
  if (onlyLiveEnemy && onlyLiveEnemy.count() > 0) {
	return shuffleArray(onlyLiveEnemy.toArray())[0].get('index');
	} else {
	  return false;
  }
}

function setAtk (state, roomId) {
  const field = state.getIn([roomId, 'field']);
  const ataksAction = field.map(function (cell) {
    if (cell.get('unit') && 
		cell.getIn(['unit', 'atk']) && 
		cell.getIn(['unit', 'ready'])  && 
		cell.getIn(['unit', 'direction']) && 
		cell.get('owner') !== '') {
		  const targetIndex = getTargetForAtk(field, cell);
		  console.log('targetIndex:'+targetIndex);
		  if (targetIndex !== false) {
		    return Map({targetIndex: targetIndex,
					    atakerIndex: cell.get('index'),
					    dmg: cell.getIn(['unit', 'atk'])});
		  } else {
		    return false;
		  }
		} else {
		  return false;
		}
	});
	return state.setIn([roomId, 'ataksAction'], 
		               List(ataksAction).filter(val => val !== false));
}

function chekRow(onlyPlyerCell, cell) {
  return chekNeighbor(onlyPlyerCell, cell, 'x');
}

function chekCol(onlyPlyerCell, cell) {
  return chekNeighbor(onlyPlyerCell, cell, 'y')
}

function chekNeighbor(onlyPlyerCell, cell, cordName) {
  const cord = cell.get(cordName);
  const findNeighbor = onlyPlyerCell.filter(cell => cell.get(cordName) === cord);
	if (findNeighbor.count() > 2) {
		return true;
	}	else {
		return false;
	}
}

function chekDiag(onlyPlyerCell) {
	const diag1 = onlyPlyerCell.filter(cell => {
		if(cell.get('index') === 0 || cell.get('index') === 4 || cell.get('index') === 8){ 
			return true;
		  } else {
			return false;
		}
	});
	const diag2 = onlyPlyerCell.filter(cell => {
		if(cell.get('index') === 2 || cell.get('index') === 4 || cell.get('index') === 6){ 
			return true;
		  } else {
			return false;
		}
	});
	if (diag1.count() === 3) {
		return diag1;
	} else if  (diag2.count() === 3 ) {
	  return diag2;
	} else {
	  return false;
	}
}


function findAtakers(field, playerNumber) {
  const onlyPlyerCell = field.filter(cell => cell.get('owner') === playerNumber);
  const rowResult = field.filter(cell => chekRow(onlyPlyerCell, cell));
  const colResult = field.filter(cell => chekCol(onlyPlyerCell, cell));
  const diagResult = chekDiag(onlyPlyerCell);
	if (rowResult.count() > 2) {
		return rowResult;
	} else if (colResult.count() > 2) {
      return colResult;
	} else if (diagResult) {
      return diagResult;
	} else {
		return List([]);
	}
}

function findPlayersAtkCell (state, roomId) {
	const field = state.getIn([roomId, 'field']);
	return state.setIn([roomId, "players", 0, 'atak'], findAtakers(field, 0))
	            .setIn([roomId, "players", 1, 'atak'], findAtakers(field, 1));
}

function calcTargetDmg (cellAtk) {
  const dmg =  cellAtk.reduce(function(prev, currentValue) {
		 return prev.set('dmg', prev.get('dmg' ) + currentValue.get('dmg'));
	 });
  console.log('dmg: ' + dmg.get('dmg'));
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
			console.log('cellAtk '+ cellAtk);
  }			
  if (cellAtk && cellAtk.count() > 0) {
  	const newHP = cell.getIn(['unit', 'hp']) - calcTargetDmg(cellAtk);
  	console.log(newHP);
    const cellResult =  cell.setIn(['unit', 'hp'],  newHP); 
    return cellResult.set('died', chekDied(cellResult));         
  } else {
  	return cell.set('died', chekDied(cell));
  }
}

function chekDied (cell) {
	if (cell.get('unit') && 
		cell.getIn(['unit', 'hp']) 
		&& cell.getIn(['unit', 'hp']) < 1) {
		console.log('died found');
		return true;
	} else {
		return false;
	}
}

function calcHp(state, roomId) {
	const ataksAction = state.getIn([roomId, 'ataksAction']);
	const oldField = state.getIn([roomId, 'field']);
	const newField = oldField.map(function (cell) {
      return callOneCellHp(oldField, ataksAction, cell);
	});
	return state.setIn([roomId, 'prevField'], state.getIn([roomId, 'field']))
	            .setIn([roomId, 'field'], List(newField));
}

function updateCellReady (cell) {
  if (cell.get('unit')) {
    return cell.setIn(['unit','ready'], true);
  } else {
    return cell;
  }
}


function setCardsReady(state, roomId) {
  const oldField = state.getIn([roomId, 'field']);	
  return state.setIn([roomId, 'field'], 
  	                 oldField.map(cell => updateCellReady(cell)));
}

export function fieldCalc (state, roomId) {
  if (state.getIn([roomId, 'field'])) {
	  return findPlayersAtkCell(
			   setCardsReady(
			     calcHp(
				   setAtk(
				     clearDeathCards(state, roomId), roomId), roomId), roomId), roomId);
  } else {
    return state;
  }
}
