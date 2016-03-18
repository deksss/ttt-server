import {Map, List} from 'immutable';

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

function setNew (state, roomId, playerNumber, cellId) {
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
		return state;
	}
}

export function canSetCardInCell (selectedCard, playerData, cell, playerNumber) {
  if (selectedCard && playerData.get('canSetCards')) {
  	const requiredId = selectedCard.getIn(['unit', 'require']) || false;
    if ((cell.get('free') && selectedCard &&
			  playerData.get('canSetCards') &&
			  requiredId !== 0 && !requiredId) ||
			 ((requiredId || requiredId === 0) &&
	      cell.getIn(['unit', 'id']) === requiredId &&
	      cell.get('owner') === playerNumber &&
			  cell.getIn(['unit', 'ready']))) {
      return true;
    }
  }  
  return false;
} 

export function setCard(state, roomId, playerNumber, cellId) {
	const playerData = state.get(roomId).get('players').get(playerNumber);
	const selectedCard = playerData.get('selectedCard') || false;
	const cell = state.getIn([roomId, 'field'])
	                  .find(value => value.get('id') === cellId) || false;
	const cellIndex = cell.get('index');
	if (canSetCardInCell(selectedCard, playerData, cell, playerNumber)) {
	  return setCardInCell (state, roomId, playerNumber, cellIndex, selectedCard);
	} else {
		return state;
	}
}

function setCardInCell (state, roomId, playerNumber, cellIndex, selectedCard) {
	return state.setIn([roomId, 'field', cellIndex, 'unit'], selectedCard.get('unit'))
							.setIn([roomId, 'field', cellIndex, 'owner'], playerNumber)
							.setIn([roomId, 'field', cellIndex, 'free'], false)
							.setIn([roomId, 'players', playerNumber, 'selectedCard'], null)
							.setIn([roomId, 'players', playerNumber, 'canSetCards'], false)
							.setIn([roomId, 'players', playerNumber, 'hand', selectedCard.get('id'), 'unit'], null)
							.setIn([roomId, 'fieldAnimation'], List([]));
}

export function findFreeCellId(state, roomId) {
  if (state.getIn([roomId, 'field'])) {
  return state.getIn([roomId, 'field'])
         .filter(cell => cell.get('free'))
         .map(cell => cell.get('id'));
  }	else {
  	return false;
  }
}
