import Express from 'express';
import Http from 'http';
import Io from 'socket.io';
import Path from 'path';
import makeStore from './store';
import uuid from 'uuid';

export function startServer(store) {

  const app = new Express();
  const http = new Http.Server(app);
  const io = new Io(http);

  http.listen(3001, function() {
      console.log('listening on *:3001');
  });

  app.use(Express.static(Path.join(__dirname, 'public')));

  store.subscribe(
  //here must select data only froom neened room
  //i think its posible with add to store key: lastFiredRoom
  // when smtn deal witch store, store must change this value
  // for this i must wrap all func
  //and sand data only from this room, and use: socket.to(lastFiredRoom)
    () => io.emit('state', store.getState().toJS())
  );

  io.on('connection', (socket) => {

    socket.on('create', (roomId, playerId) => {
      socket.to(roomId).emit('your room id', roomId);

      socket.join(roomId);
      store.dispatch({type: 'CREATE_ROOM', roomId: roomId, playerId: playerId});

      console.log('room create: by player ' + playerId);
      console.log(store.getState().toJS());

      socket.to(roomId).emit('state', store.getState().toJS());
      socket.to(roomId).emit('your room id', roomId);
      socket.on('action', store.dispatch.bind(store));
      console.log('new room ID: ' + roomId);
    });

    socket.on('join', (roomId, playerId) => {
      socket.join(roomId);
      store.dispatch({type: 'JOIN_ROOM', roomId: roomId, playerId: playerId});

      console.log('room '+ roomId +' join: by player ' + playerId);
      console.log(store.getState().toJS());

      socket.join(roomId);
      socket.to(roomId).emit('state', store.getState().toJS());
      socket.to(roomId).emit('your room id', roomId);
      store.dispatch({type: 'NEXT_TURN', roomId: roomId});
      socket.on('action', store.dispatch.bind(store));
      console.log('player connect to room ID: ' + roomId);
    });

  });
}
