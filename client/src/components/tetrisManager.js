import React, { useState, useEffect } from 'react';
import './App.css';

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

export const Tetris = ({ socket }) => {
  const [grids, setGrids] = useState({});
  const [isGameStart, setIsGameStart] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomGameEnd', () => {
      setIsGameStart(false);
      setGrids({});
      console.log(`Room game end`);
    });

    socket.on('roomGameUpdate', (updatedGrids) => {
      setGrids(updatedGrids);
      console.log(`Room game update`);
    });

    socket.on('roomGameStart', () => {
      setIsGameStart(true);
      console.log(`Room game start`);
    });

    return () => {
      socket.off('roomGameEnd');
      socket.off('roomGameUpdate');
      socket.off('roomGameStart');
    };
  }, []);

  if (!isGameStart) {
    return null;
  }

  const renderOtherSpectres = () => {
    const spectreKeys = Object.keys(grids);
    if (spectreKeys.length <= 1) return null;

    // Retourner les spectres des autres joueurs sous forme de composants graphiques
    return spectreKeys.slice(1).map(key => {
      const playerId = grids[key][0];
      const spectre = grids[key].slice(1);

      return (
        <div key={key} className="player-spectre-container">
          <PlayerSpectre playerId={playerId} spectre={spectre} />
        </div>
      );
    });
  };

  // Affichage de la disposition globale de l'interface utilisateur
  return (
    <div className="container">
      <div className="left-section">
      </div>
      <div className="middle-section">
        {grids[Object.keys(grids)[0]] && (
          <PlayerGrid grid={grids[Object.keys(grids)[0]]} />
        )}
      </div>
      <div className="right-section">
        {renderOtherSpectres()}
      </div>
    </div>
  );
};

const pieceColors = {
  "-1": 'gray',
  "1": 'yellow',
  "2": 'cyan',
  "3": 'orange',
  "4": 'blue',
  "5": 'purple',
  "6": 'red',
  "7": 'green'
};

const PlayerGrid = ({ grid }) => (
  <div>
    {grid.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex' }}>
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: pieceColors[cell] || 'black',
              border: '1px solid black',
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

const PlayerSpectre = ({ playerId, spectre }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <span style={{ marginBottom: '10px' }}>{playerId}</span>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {spectre.map((height, colIndex) => (
        <div key={colIndex} style={{ display: 'flex', flexDirection: 'column-reverse' }}>
          {[...Array(height).keys()].map((rowIndex) => (
            <div
              key={rowIndex}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: 'gray',
                border: '1px solid black',
              }}
            />
          ))}
          {[...Array(ROWS - height).keys()].map((rowIndex) => (
            <div
              key={rowIndex}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: 'transparent',
                border: '1px solid black',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Tetris;
