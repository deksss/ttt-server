import {Map, List, fromJS} from 'immutable';
import {expect} from 'chai';

import {chekWin, setCurPlayer} from '../src/game/game';

describe('chekWin', () => {

  it(' chek hp for all players and return P2 Win', () => {
    
    const roomId = "1";
    
    const state = Map({
          'players': List([
                Map({'hp': 0}), 
                Map({'hp': 10})])
      });

    const expactedState =  Map({
                'winner': 'P2' , 
                'players': 
                  List([Map({'hp': 0}), 
                        Map({'hp': 10})])
      }); 

    const newState = chekWin(state, roomId);
    expect(newState).to.equal(expactedState);
  });

  it(' chek hp for all players and return P1 Win', () => {
    
    const roomId = "1";

    const state = Map({
          'players': List([
                Map({'hp': 15}), 
                Map({'hp': -1})])
      });

    const expactedState =  Map({
                'winner': 'P1' , 
                'players': 
                  List([Map({'hp': 15}), 
                        Map({'hp': -1})])
      }); 


    const newState = chekWin(state, roomId);
    expect(newState).to.equal(expactedState);
  });

    it(' chek hp for all players and return draw', () => {
    
    const roomId = "1";

    const state = Map({
          'players': List([
                Map({'hp': 0}), 
                Map({'hp': -1})])
      });

    const expactedState =  Map({
                'winner': 'Draw!' , 
                'players': 
                  List([Map({'hp': 0}), 
                        Map({'hp': -1})])
      }); 


    const newState = chekWin(state, roomId);
    expect(newState).to.equal(expactedState);
  });
});

describe('getCurPlayer', () => {
  it('get roomState and return new state withc info who turn', () => {
    const state = Map({
          'players': List([
                Map({'name': 'P1'}), 
                Map({'name': 'P2'})])
      });
    const p1name = state.getIn(['players', 0, 'name']);
    const p2name = state.getIn(['players', 1, 'name']);
    
    const newState =  setCurPlayer(state);
    expect(newState.get('curPlayer')).to.be.oneOf([p1name, p2name]);
  });
});