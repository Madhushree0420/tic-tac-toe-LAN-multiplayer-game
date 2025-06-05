import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styled from 'styled-components';

// Initialize socket with connection options and debug logging
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  debug: true
});

// Log socket state for debugging
socket.on('connect', () => console.log('Socket ID:', socket.id));
socket.on('connect_error', (error) => console.log('Connection Error:', error));

interface GameState {
  board: (string | null)[];
  currentTurn: string;
  gameId: string | null;
  playerSymbol: 'X' | 'O' | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentTurn: '',
    gameId: null,
    playerSymbol: null,
    gameStatus: 'waiting',
    winner: null
  });

  // Separate state for input game ID
  const [inputGameId, setInputGameId] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    socket.on('gameCreated', ({ gameId, symbol }) => {
      console.log('Game created:', gameId);
      setGameState(prev => ({
        ...prev,
        gameId,
        playerSymbol: symbol,
        gameStatus: 'waiting'
      }));
    });

    socket.on('gameJoined', ({ gameId, symbol }) => {
      console.log('Game joined:', gameId);
      setGameState(prev => ({
        ...prev,
        gameId,
        playerSymbol: symbol,
        gameStatus: 'playing'
      }));
    });

    socket.on('gameStart', ({ board, currentTurn }) => {
      console.log('Game started, current turn:', currentTurn);
      setGameState(prev => ({
        ...prev,
        board,
        currentTurn,
        gameStatus: 'playing'
      }));
    });

    socket.on('updateGame', ({ board, currentTurn }) => {
      setGameState(prev => ({
        ...prev,
        board,
        currentTurn
      }));
    });

    socket.on('gameOver', ({ winner, board }) => {
      setGameState(prev => ({
        ...prev,
        board,
        winner,
        gameStatus: 'finished'
      }));
    });

    socket.on('error', (message) => {
      console.error('Game error:', message);
      alert(message);
    });

    socket.on('playerDisconnected', () => {
      alert('Other player disconnected');
      setGameState({
        board: Array(9).fill(null),
        currentTurn: '',
        gameId: null,
        playerSymbol: null,
        gameStatus: 'waiting',
        winner: null
      });
      setInputGameId('');
    });

    // Cleanup function
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStart');
      socket.off('updateGame');
      socket.off('gameOver');
      socket.off('error');
      socket.off('playerDisconnected');
    };
  }, []);

  const createGame = () => {
    if (!connected) {
      alert('Not connected to server. Please wait for connection...');
      return;
    }
    console.log('Creating new game...');
    socket.emit('createGame');
  };

  const joinGame = () => {
    if (!connected) {
      alert('Not connected to server. Please wait for connection...');
      return;
    }
    if (inputGameId.trim()) {
      console.log('Joining game:', inputGameId.trim());
      socket.emit('joinGame', inputGameId.trim());
    }
  };

  const handleCellClick = (index: number) => {
    if (
      !connected ||
      gameState.gameStatus !== 'playing' ||
      gameState.board[index] ||
      gameState.currentTurn !== socket.id
    ) {
      return;
    }

    socket.emit('makeMove', { gameId: gameState.gameId, index });
  };

  return (
    <Container>
      <Title>Tic Tac Toe - LAN Multiplayer</Title>
      
      {!connected && (
        <ConnectionStatus>
          Connecting to server...
        </ConnectionStatus>
      )}

      {!gameState.gameId ? (
        <MenuContainer>
          <Button onClick={createGame} disabled={!connected}>
            Create New Game
          </Button>
          <JoinGameContainer>
            <Input
              type="text"
              placeholder="Enter Game ID"
              value={inputGameId}
              onChange={(e) => setInputGameId(e.target.value)}
              disabled={!connected}
            />
            <Button 
              onClick={joinGame} 
              disabled={!connected || !inputGameId.trim()}
            >
              Join Game
            </Button>
          </JoinGameContainer>
        </MenuContainer>
      ) : (
        <GameContainer>
          <GameInfo>
            {gameState.gameStatus === 'waiting' && (
              <>
                <p>Waiting for opponent to join...</p>
                <p>Share this Game ID: {gameState.gameId}</p>
              </>
            )}
            {gameState.gameStatus === 'playing' && (
              <p>
                {gameState.currentTurn === socket.id
                  ? "Your turn"
                  : "Opponent's turn"}
              </p>
            )}
            {gameState.gameStatus === 'finished' && (
              <p>
                {gameState.winner === 'draw'
                  ? "It's a draw!"
                  : gameState.winner === gameState.playerSymbol
                  ? 'You won!'
                  : 'You lost!'}
              </p>
            )}
          </GameInfo>
          
          <Board>
            {gameState.board.map((cell, index) => (
              <Cell
                key={index}
                onClick={() => handleCellClick(index)}
                isActive={gameState.currentTurn === socket.id}
              >
                {cell}
              </Cell>
            ))}
          </Board>
        </GameContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f0f2f5;
`;

const Title = styled.h1`
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const ConnectionStatus = styled.div`
  color: #f44336;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  font-weight: bold;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const JoinGameContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const GameInfo = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #333;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Cell = styled.div<{ isActive: boolean }>`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  background-color: ${props => props.isActive ? '#e8f5e9' : '#fff'};
  border: 2px solid #ccc;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isActive ? '#c8e6c9' : '#f5f5f5'};
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  color: white;
  background-color: ${props => props.disabled ? '#cccccc' : '#1976d2'};
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#1565c0'};
  }
`;

const Input = styled.input`
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  opacity: ${props => props.disabled ? '0.6' : '1'};

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

export default App; 