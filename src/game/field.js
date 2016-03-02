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
	if (cell.get('free') && selectedCard && playerData.get('canSetCards')) {
		return state.setIn([roomId, 'field', cellIndex, 'unit'], selectedCard.get('unit'))
		            .setIn([roomId, 'field', cellIndex, 'owner'], playerNumber)
		            .setIn([roomId, 'field', cellIndex, 'free'], false)
		            .setIn([roomId, 'players', playerNumber, 'selectedCard'], null)
		            .setIn([roomId, 'players', playerNumber, 'canSetCards'], false)
		            .setIn([roomId, 'players', playerNumber, 'hand', selectedCard.get('id'), 'unit'], null)
		            .setIn([roomId, 'fieldAnimation'], List([]));
	} else {
		return state.setIn([roomId, 'fieldAnimation'], List([]));
	}
}

function nextPrepeare (state) {
	return state.set('field', state.get('field').map(function (cell) {
		                 if (cell.get('died')) {
			               return cell.set('died', false)
			                          .set('free', true)
			                          .set('owner', '')
					                  .set('unit', false);
		                 } else {
			               return cell;
		                 }
	             }))
	            .set('ataksAction', List([]))
							.set('fieldAnimation', List([]));
}

function normalizeDirects (cell, field) {
  const DIRECTIOINS = {'UL': {x:-1, y: -1},
	  'U': {x: 0, y: -1},
	  'UR':{x: 1, y: -1},
	  'L': {x: -1, y: 0},
	  'R': {x: 1, y: 0},
	  'DL':{x:-1, y: 1},
	  'D': {x: 0, y: 1},
	  'DR':{x: 1, y: 1}};

  return cell.getIn(['unit', 'direction']).map(direct => {
		const x = Number(DIRECTIOINS[direct].x) + Number(cell.get('x'));
		const y = Number(DIRECTIOINS[direct].y) + Number(cell.get('y'));
		const correct = field.find(val => {
			if (val.get('y') == y && val.get('x') == x) {
				return true;
			} else  {
				return false;
			}
		  });
		if (correct && (correct.get('index') === 0 || correct.get('index'))) {
		  return Map({index: correct.get('index'), x: x, y: y, direct: direct});
		}
	}).filter(val => val);
}

function getTargetForAtk (field, cell) {
  const directs = normalizeDirects(cell, field);
	var targetCell = false;
  const onlyLiveEnemy =  List(directs.filter(direct => {
		if (field.get(direct.get('index')) || field.get(direct.get('index')) === 0) {
		  targetCell = field.get(direct.get('index'));
		};
	  if (targetCell !== false &&
		  targetCell.get('owner') !== '' &&
		  targetCell.get('owner') !== cell.get('owner')) {
	    return true;
	  }  else {
	    return false;
	  }
  }));
  if (onlyLiveEnemy && onlyLiveEnemy.count() > 0) {
	  return shuffleArray(onlyLiveEnemy.toArray())[0];
	} else {
	  return false;
  }
}

function setAtk (state) {
  const field = state.get('field');
  const ataksAction = field.map(function (cell) {
    if (cell.get('unit') &&
		cell.getIn(['unit', 'atk']) &&
		cell.getIn(['unit', 'ready'])  &&
		cell.getIn(['unit', 'direction']) &&
		cell.get('owner') !== '') {
		  const target = getTargetForAtk(field, cell);

			if (target === 0 || target) {
		    return Map({targetIndex: target.get('index'),
					         atakerIndex: cell.get('index'),
					         dmg: cell.getIn(['unit', 'atk']),
								   direct: target.get('direct')});
		  } else {
		    return false;
		  }
		} else {
		  return false;
		}
	});
	return state.set('ataksAction',
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

function findPlayersAtkCell (state) {
	const field = state.get('field');
	return state.setIn([ "players", 0, 'atak'], findAtakers(field, 0))
	            .setIn(["players", 1, 'atak'], findAtakers(field, 1));
}

function calcTargetDmg (cellAtk) {
  const dmg =  cellAtk.reduce(function(prev, currentValue) {
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

function chekDied (cell) {
	if (cell.get('unit') &&
		  cell.getIn(['unit', 'hp']) < 1) {
		return true;
	} else {
		return false;
	}
}

function calcHp(state) {
	const ataksAction = state.get('ataksAction');
	const oldField = state.get('field');
	const newField = oldField.map(function (cell) {
      return callOneCellHp(oldField, ataksAction, cell);
	});
	return state.set('prevField', state.getIn( 'field'))
	            .set('field', List(newField));
}

function genPlayerAtak(state, player)  { 
  const atakFrame = state.getIn([ 'players', player, 'atak']) || false;
  if (atakFrame && atakFrame.count() > 2) { 
    return state.get('field').map(cell => {
		               if (atakFrame.find(cellAtk => cellAtk.get('index') === cell.get('index'))) {
		                 return cell.set('atakPlayer', true);	
		               } else {
		               	return cell;
		               }   
		    })  
  } else {
  	return false;
  }
}

function genFieldAnimation (state) {
  let animatedField = state.get('ataksAction')
	                         .map(function (atak) {
      return  state.get('field')
                   .setIn([atak.get('targetIndex'), 'dmgGet'], atak.get('dmg'))
			       .setIn([atak.get('atakerIndex'), 'atkDirect'], atak.get('direct') );
  });
  const p1atak = genPlayerAtak(state, 0);
  const p2atak = genPlayerAtak(state, 1);

  if (p1atak) { 
    return state.set( 'fieldAnimation', 
		             animatedField.push(p1atak));
  } else if (p2atak) {
  	  return state.set( 'fieldAnimation', 
		             animatedField.push(p2atak));
  } else {
    return state.set('fieldAnimation', 
		             animatedField);	
  }
}

function updateCellReady (cell) {
  if (cell.get('unit')) {
    return cell.setIn(['unit','ready'], true);
  } else {
    return cell;
  }
}


function setCardsReady(state) {
  return state.set('field',
  	               state.get( 'field').map(cell => updateCellReady(cell)));
}

export function fieldCalc (state, roomId) {
  if (state.getIn([roomId, 'field'])) {
  	let roomState = state.get(roomId);
	  return state.set(roomId, genFieldAnimation(
		                       findPlayersAtkCell(
			                   setCardsReady(
			                   calcHp(
				               setAtk(
				               nextPrepeare(roomState)))))));

  } else {
    return state;
  }
}
