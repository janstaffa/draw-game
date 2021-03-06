import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';
import Chat from './Chat';

class Game extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var canvas = document.getElementById("game")
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    render() {
        return (
            <div className="game">
                <main>
                    <div className="left-panel">
                        <Chat />
                    </div>
                    <Canvas />
                </main>
            </div>
        );
    }
}

export default Game;