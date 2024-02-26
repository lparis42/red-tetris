import React, { useState, useEffect } from 'react';

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

export const Tetris = ({ socket }) => {
  const [grids, setGrids] = useState({
    player1: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    player2: Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  });
  const [isGameStart, setIsGameStart] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('lobbyGameEnd', () => {
      setIsGameStart(false);
      setGrids({
        player1: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
        player2: Array.from({ length: ROWS }, () => Array(COLS).fill(0))
      });
      console.log(`Lobby game end`);
      return;
    });

    socket.on('lobbyGameUpdate', ({ gridPlayer1, gridPlayer2 }) => {
      setGrids({ player1: gridPlayer1, player2: gridPlayer2 });
      console.log(`Lobby game update`);
    });

    socket.on('lobbyGameStart', () => {
      setIsGameStart(true);
      console.log(`Lobby game start`);
    });

    return () => {
      socket.off('lobbyGameEnd');
      socket.off('lobbyGameUpdate');
      socket.off('lobbyGameStart');
    };
  }, []);

  if (!isGameStart) {
    return null;
  }

  return (
    <div style={{ display: 'flex' }}>
      <PlayerGrid grid={grids.player1} />
      <div style={{ width: '50px' }}></div> { }
      <PlayerGrid grid={grids.player2} />
    </div>
  );
};

const pieceColors = {
  1: 'yellow',
  2: 'cyan',
  3: 'orange',
  4: 'blue',
  5: 'purple',
  6: 'red',
  7: 'green'
};

const PlayerGrid = ({ grid }) => (
  <div style={{ marginRight: '50px' }}>
    {grid.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex' }}>
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: pieceColors[cell] || 'white',
              border: '1px solid black',
              boxSizing: 'border-box'
            }}
          />
        ))}
      </div>
    ))}
  </div>
);
