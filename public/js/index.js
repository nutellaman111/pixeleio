const socket = io();

let gameState;
socket.on('b.gameState', (bGameState) => {
    gameState = bGameState;

    RenderBoard();
});