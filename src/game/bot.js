import {playerStart, nextTurn} from  './game';
import {selectCard} from  './deck';
import {setCard, findFreeCellId} from  './field';
import {shuffleArray} from '../utils';

// to do: I move on room id and it is all this stuff dosnt work now
// need to by fixed
export function sendSelectCard (state, roomId, playerNumber) {
  const hand = state.getIn([roomId, 'players', playerNumber, 'hand']) || false;	
  console.log('hand ' + hand)
  if (hand && hand.count() > 0) {
    console.log('1playerNumberInBot ' + playerNumber);
    return selectCard(state, roomId, playerNumber, hand.getIn([0, 'id']));
  }  else {
    return state;
  }
}

export function sendSetCard (state, roomId, playerNumber) {
  let cellId = false;
  if (state.getIn(roomId, 'field')) {
    let freeCelss = findFreeCellId(state, roomId);
    if (freeCelss) {
      cellId = shuffleArray(findFreeCellId(state, roomId).toJS())[0];
    }
    if (cellId || cellId === 0) {
      return setCard(state, roomId, playerNumber, cellId);	 
    } else {
      return state;
    }
  } else {
    return state;
  }
}

export function sendEndTurn (state, roomId) {
  return nextTurn(state, roomId);
}

export function botTurn (state, roomId, playerNumber) {
  console.log('0playerNumberInBot ' + playerNumber);
    return sendEndTurn(
           sendSetCard(
           sendSelectCard(state, roomId, playerNumber), 
                          roomId, playerNumber),
                          roomId);
}