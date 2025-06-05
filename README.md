# Tic Tac Toe - LAN Multiplayer

A real-time multiplayer Tic Tac Toe game that can be played over LAN using Socket.IO for communication.

## Features

- Create or join games using game IDs
- Real-time game updates
- Beautiful and responsive UI
- Player disconnection handling
- Turn-based gameplay

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd tic-tac-toe-lan
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Game

1. Start the server:
   ```bash
   # In the tic-tac-toe-lan directory
   npm start
   ```

2. Start the client:
   ```bash
   # In the tic-tac-toe-lan/client directory
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. First player creates a new game and gets a game ID
2. Second player joins using the game ID
3. Players take turns placing their marks (X or O)
4. First player to get three in a row wins!

## Technical Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Real-time Communication: Socket.IO
- Styling: Styled Components

## Network Configuration

By default, the server runs on port 3001 and the client on port 3000. Make sure these ports are available and not blocked by your firewall.

To play over LAN:
1. Find the IP address of the computer running the server
2. Other players should use that IP address instead of localhost when connecting

## License

MIT 
