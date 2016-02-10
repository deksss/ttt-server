import {Map, List} from 'immutable';
import {shuffleArray} from '../utils';

export function genereateNewFied () {
	const gameFieldId = ['00', '01', '02', '10', '11', '12', '20', '21', '22'].map(
		function (value, index) {
			return Map({index: index,
				          id: value,
									x: value[0],
									y: value[1],
									free: true,
									owner: ''});
});
	return List(gameFieldId);
}

function setCell(state, roomId, playerNumber, cellId) {
	const playerData = state.get(roomId).get('players').get(playerNumber);
	const playerSelectedCard = playerData.get('selectedCard') || false;
	const cell = state.get(roomId)
	                  .get('field')
	                  .find(value => value.get('id') === cellId) || false;
	const cellIndex = cell.get('index');
	if (cell && cell.free && playerSelectedCard) {
		return state.setIn([roomId, 'field', cellIndex, 'unit'], playerSelectedCard)
		            .setIn([roomId, 'field', cellIndex, 'free'], false)
		            .setIn([roomId, 'players', playerNumber, 'selectedCard'], '')
		            .setIn([roomId, 'field', cellIndex, 'owner'], playerNumber);
	} else {
		return false;
	}
}

function getNormalDirection (direct) {
	const DIRECTIOINS = {'UL': {x:-1, y: -1}, 'U': {x: 0, y: -1}, 'U': {x: 1, y: -1},
	              'L':  {x: -1, y: 0}, 'R': {x: 1, y: 0},
	              'DL': {x:-1, y: 1}, 'D': {x: 0, y: 1}, 'DR': {x: 1, y: 1}};
	const x = DIRECTIOINS[direct].x + cell.x;
	const y = DIRECTIOINS[direct].y + cell.y;
	const id = '' + x + y;
	return {id, x, y};
}

function getTargetForAtk (field, cell) {
  const normalizedDirects = cell.direct.map(getNormalDirection(direct, cell));
	const onlyLiveEnemy =  normalizedDirects.filter(function (direct) {
		const targetCell = field[direct.id];
	  if (targetCell && !targetCell.died && targetCell.owner !== cell.owner) {
			return true;
		}	else {
			return false;
		}
	});
	return shuffleArray(onlyLiveEnemy).splice(0, 1);
}

function clearDeathCards (state, roomId) {
	return state.updateIn([roomId, 'field'], function (cell) {
		if (cell.get('died')) {
			return cell.set('died', false)
			           .set('free', true)
			           .set('owner', '');
		}
	}).setIn([roomId, 'field', 'atakAction'], List([]));
}

function setAtk (state, roomId) {
	const field = state.getIn([roomId, 'field']).toJS();
	const ataksAction = field.map(function (cell) {
		if (cell.atk && cell.direction && cell.owner !== '') {
			return {targetId: getTargetForAtk(field, cell),
				      atakerId: cell['id'],
							dmg: cell['atk']};
		}
	});
	return state.setIn([roomId, 'atakAction'], List(ataksAction));
}

function calcHp(state, roomId) {
	const ataksAction = state.getIn([roomId, 'atakAction']);
	const newField = state.getIn([roomId, 'field']).toJS().map(function (cell) {
		const id = cell.id;
    cell.hp = cell.hp - ataksAction.filter(action => action.targetId = id)
		                         .reduce(function(prev, currentValue) {
                                return prev + currentValue.dmg;
                              });
	  return cell;
	});
	return state.setIn([roomId, 'prevField'], state.getIn([roomId, 'field']))
	            .setIn([roomId, 'field'], List(newField));
}

export function fieldCalc (state, roomId) {
	return calcHp(setAtk(clearDeathCards(state, roomId)));
}
