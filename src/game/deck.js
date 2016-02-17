import {getUnitById} from './units';
import {shuffleArray} from '../utils';
import {List, Map} from 'immutable';

const MAXCARDINHAND = 5;

export function generateDeck (state, roomId, playerNumber, deckId) {
  const START_CARD_COUNT = 3;
  const deckUnitIds = require('./deck/' + deckId +'.json');
  const deck = shuffleArray(deckUnitIds.map(unitId => getUnitById(state, unitId)));
  const hand = deck.splice(0, START_CARD_COUNT).map( function(unit, index) {
  	return Map({id: index, unit: unit});
  }  );

  return {'deck': List(deck), 'hand': state.get('initHand').merge(List(hand))};
}


export function getCard (state, roomId, playerNumber, count = 1) {
  if (state.getIn([roomId, 'players', playerNumber, 'deck'])) {
    const deck = state.getIn([roomId, 'players', playerNumber, 'deck']);
    const hand = state.getIn([roomId, 'players', playerNumber, 'hand']);  
    const freeCardSlot = hand.find(card => card.get('unit') === null);
    var freeId;                                               
   
    if (!deck.isEmpty() && freeCardSlot) {  
      freeId = freeCardSlot.get('id'); 
      if (count <= 1) {
        return state.setIn([roomId, 'players', playerNumber, 'hand'], 
                           hand.map( card => {
                              if (card.get('id') === freeId) {
                                return card.set('unit',  deck.last()); 
                              } else {
                                return card;
                              }
                            }))
                     .setIn([roomId, 'players', playerNumber, 'deck'], deck.pop());
      } else {
        getCard(state.setIn([roomId, 'players', playerNumber, 'hand'], 
                            hand.map( card => {
                              if (card.get('id') === freeId) {
                                return card.set('unit',  deck.last()); 
                              } else {
                                return card;
                              }
                            }))
                     .setIn([roomId, 'players', playerNumber, 'deck'], deck.pop()), 
                           roomId, playerNumber, count - 1);
      }

    }	else {
  	  return state;
    }
  } else {
    return state;
  }
}

function selectValidation(data) {
  if (data.selectedCard) {
    return true;
  } else {
  	return false;
  }
}

export function selectCard(state, roomId, playerNumber, id) {
  console.log('roomId '+ roomId);
  console.log('playerNumber ' + playerNumber);
  console.log('cardId '+ id);
  const data = {};
  data.selectedCard = state.getIn([roomId, 'players', playerNumber, 'hand'])
                           .find(card => card.get('id') === id);
  data.roomId = roomId || false;
  data.playerNumber = playerNumber || false;
  if (selectValidation(data)) {
    return state.setIn([roomId, 'players', playerNumber, 'selectedCard'], data.selectedCard);
  } else {
    return state;
  }
}
