import {getUnitById} from './units';
import {shuffleArray} from '../utils';
import {List, Map} from 'immutable';

const MAXCARDINHAND = 5;

export function generateDeck (state, deckId) {
  const START_CARD_COUNT = 3;
  const deckUnitIds = require('./deck/' + deckId +'.json');
  const deck = shuffleArray(deckUnitIds.map(unitId => getUnitById(state, unitId)));
  const hand = deck.splice(0, START_CARD_COUNT).map(function(unit, index) {
  	return Map({id: index, unit: unit, new: true});
  }  );

  return {'deck': List(deck), 'hand': state.get('initHand').merge(List(hand))};
}

export function selectDeck (state, roomId, playerNumber, deck) {
  return state.setIn([roomId, 'players', playerNumber, 'deckName'], deck);
}

export function getCardInRoom (state, roomId, playerNumber, count = 1) {
  const roomState = state.get(roomId);
  return state.set(roomId, getCard(roomState, playerNumber, count));
}

function getOneCard (state, playerNumber, deck, hand, freeId) {
  return state.setIn(['players', playerNumber, 'hand'],
                           hand.map( card => {
                              if (card.get('id') === freeId) {
                                return card.set('unit',  deck.last())
                                           .set('new',  true);
                              } else {
                                return card.set('new', false);
                              }
                            }))
              .setIn(['players', playerNumber, 'deck'], deck.pop());    
}

export function getCard (state, playerNumber, count = 1) {
  if (state.getIn(['players', playerNumber, 'deck'])) {
    const deck = state.getIn(['players', playerNumber, 'deck']);
    const hand = state.getIn(['players', playerNumber, 'hand']);
    const freeCardSlot = hand.find(card => card.get('unit') === null);
    var freeId;

    if (!deck.isEmpty() && freeCardSlot) {
      freeId = freeCardSlot.get('id');
      if (count <= 1) {
         return getOneCard(state, playerNumber, deck, hand, freeId);
      } else {
        return getCard(
          getOneCard(state,  playerNumber, deck, hand, freeId), 
           playerNumber, count - 1);
      }
    } else {
      return state;
    }
  } else {
    return state;
  }
}

export function getCardForPrevCurPlayer (roomState) {
  const playerNumber = roomState.get('oldCurPlayer');
  return getCard(roomState, playerNumber, 1);
}


function selectValidation(data) {
  if (data.selectedCard) {
    return true;
  } else {
  	return false;
  }
}

export function selectCard(state, roomId, playerNumber, id) {
  const data = {};
  data.oldSeletedCard = state.getIn([roomId, 'players', playerNumber, 'selectedCard']);
  data.selectedCard = state.getIn([roomId, 'players', playerNumber, 'hand'])
                           .find(card => card.get('id') === id);
  data.roomId = roomId || false;
  data.playerNumber = playerNumber;
  if (selectValidation(data)) {
    if (data.oldSeletedCard !== data.selectedCard)
      return state.setIn([roomId, 'players', playerNumber, 'selectedCard'], 
        data.selectedCard)
                  .setIn([roomId, 'fieldAnimation'], List([]));
    else {
      return state.setIn([roomId, 'players', playerNumber, 'selectedCard'], 
        {})
                  .setIn([roomId, 'fieldAnimation'], List([]));      
    }
  } else {
    return state.setIn([roomId, 'fieldAnimation'], List([]));
  }
}
