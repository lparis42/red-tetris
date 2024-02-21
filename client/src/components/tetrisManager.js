import React, { useState, useEffect } from 'react';

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

export const Tetris = () => {
  const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState([]);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });

  useEffect(() => {
    const intervalId = setInterval(() => movePieceDown(), 1000); // Move piece down every second

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCurrentPiece(generateRandomPiece());
  }, []);

  useEffect(() => {
    const updatedGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    currentPiece.forEach(([row, col]) => {
      updatedGrid[currentPosition.row + row][currentPosition.col + col] = 1;
    });

    setGrid(updatedGrid);
  }, [currentPiece, currentPosition]);

  const generateRandomPiece = () => {
    // Here you can implement logic to generate random Tetris pieces
    // For simplicity, let's generate a single block piece at the top
    return [[0, 4]];
  };

  const movePieceDown = () => {
    setCurrentPosition(prevPosition => ({
      ...prevPosition,
      row: prevPosition.row + 1
    }));
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell === 1 ? 'blue' : 'white',
                border: '1px solid black',
                boxSizing: 'border-box'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
