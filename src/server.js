import Express from 'express';
import Http from 'http';
import Io from 'socket.io';
import Path from 'path';
import makeStore from './store';
import uuid from 'uuid';

let currentRooms;

export function startServer(store) {

  const app = new Express();
  const http = new Http.Server(app);
  const io = new Io(http);

  http.listen(3001, function() {
      console.log('listening on *:3001');
  });

  app.use(Express.static(Path.join(__dirname, 'public')));


  store.subscribe(
    () => {
      let previousRooms = currentRooms;
      currentRooms = store.getState().get('rooms');
      if (previousRooms !== currentRooms) {
        io.emit('rooms state', currentRooms.toJS());
      }
    }
  );

  io.on('connection', (socket) => {
    socket.emit('rooms state', store.getState().toJS().rooms);
    
    socket.on('create', (roomId, playerId, name) => {
      let currentRoom;
      socket.join(roomId);
      store.subscribe(
        () => {
          let previousRoom = currentRoom;
          currentRoom = store.getState().get(roomId);
          if (previousRoom !== currentRoom) {
             socket.to(roomId).emit('state', currentRoom.toJS())  ;
          }
        }
      );
      store.dispatch({type: 'CREATE_ROOM', roomId: roomId, playerId: playerId, name: name});
      socket.to(roomId).emit('state', store.getState().get(roomId).toJS());
      socket.to(roomId).emit('your room id', roomId);
      socket.on('action', store.dispatch.bind(store));
      console.log('new room ID: ' + roomId);
    });

    socket.on('join', (roomId, playerId, name) => {
      let currentRoom;
      socket.join(roomId);
      store.dispatch({type: 'JOIN_ROOM', roomId: roomId, playerId: playerId, name: name});

      socket.join(roomId);
      socket.to(roomId).emit('state', store.getState().get(roomId).toJS());
      store.dispatch({type: 'NEXT_TURN', roomId: roomId});
      socket.on('action', store.dispatch.bind(store));
      console.log('player connect to room ID: ' + roomId);
      store.subscribe(
        () => {
          let previousRoom = currentRoom;
          currentRoom = store.getState().get(roomId);
          if (previousRoom !== currentRoom) {
             socket.to(roomId).emit('state', currentRoom.toJS())  ;
          }
        }
      );
    });

      socket.on('createVsBot', (roomId, playerId, name) => {
      socket.join(roomId);
      store.dispatch({type: 'CREATE_ROOM_VS_BOT', roomId: roomId, playerId: playerId, name: name});
      socket.to(roomId).emit('state', store.getState().toJS());
      store.dispatch({type: 'NEXT_TURN', roomId: roomId});
      socket.on('action', store.dispatch.bind(store));
    });

  });
}
