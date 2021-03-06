import React, { useState, useEffect } from 'react';
import { IoRefreshCircleOutline } from "react-icons/io5";
import { socket } from './socket';
import SplashScreen from './SplashScreen';


class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = { fillColor: 'black', brushSize: 5, theme: '', time: '2:00', round: 1, roundended: false };
    }

    componentDidMount() {
        this.canvas = document.getElementById("game")
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.ctx = this.canvas.getContext("2d");

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const select = document.getElementById('color-select');
        const colorPreview = document.getElementById('color-preview');
        Array.from(select.options).forEach(option => {
            option.style.backgroundColor = option.value;
        });

        socket.on('draw', (payload) => {
            this.draw(payload.x, payload.y, payload.size, payload.color);
        });
        socket.on('mouseup', () => {
            this.ctx.beginPath();
        });
        socket.on('resetCanvas', () => {
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });

        socket.on('roundStart', (data) => {
            this.banDraw();
            this.setState({ theme: '', round: data.round, roundended: false });
        });

        socket.on('allowDraw', (data) => {
            this.allowDraw();
            this.setState({ theme: data.theme });
        });

        socket.on('timer', (data) => {
            console.log(data);
            const seconds = data.time;
            const time = new Date(seconds * 1000);

            const formated = `${('0' + time.getMinutes().toString()).slice(-2)}:${('0' + time.getSeconds().toString()).slice(-2)}`;
            this.setState({ time: formated });
        });

        socket.on('gameEnd', (data) => {
            console.log(data);
            this.setState({ roundended: data })
        });
    }
    banDraw = () => {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("focusout", this.lostFocus);

        const select = document.getElementById('color-select');
        select.removeEventListener('change', this.onSelectChange);

        document.querySelector('.game main .canvas .selection-panel select').style.pointerEvents = 'none';
        document.querySelector('#size-slider').style.pointerEvents = 'none';
        document.querySelector('#reset-canvas').style.pointerEvents = 'none';
    }
    allowDraw = () => {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("focusout", this.lostFocus);

        const select = document.getElementById('color-select');
        select.addEventListener('change', this.onSelectChange);

        document.querySelector('.game main .canvas .selection-panel select').style.pointerEvents = 'all';
        document.querySelector('#size-slider').style.pointerEvents = 'all';
        document.querySelector('#reset-canvas').style.pointerEvents = 'all';
    }
    onMouseDown = (event) => {
        this.canvas.addEventListener("mousemove", this.handleDraw);
        this.handleDraw(event);
    }
    onMouseUp = (event) => {
        this.canvas.removeEventListener("mousemove", this.handleDraw);
        this.ctx.beginPath();
        socket.emit('mouseup');
    }
    onSelectChange = (event) => {
        const select = document.getElementById('color-select');
        const colorPreview = document.getElementById('color-preview');

        colorPreview.style.backgroundColor = select.value;
        this.setState({ fillColor: select.value });
    }
    handleDraw = (event) => {
        const x = event.clientX - this.canvasRect.left;
        const y = event.clientY - this.canvasRect.top;

        this.draw(x, y, this.state.brushSize, this.state.fillColor);

        let data = {
            x,
            y,
            color: this.state.fillColor,
            size: this.state.brushSize
        };
        socket.emit('draw', data);
    }

    draw = (x, y, brushSize, fillColor) => {
        const ctx = this.ctx;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        ctx.lineTo(x, y);
        ctx.strokeStyle = fillColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    lostFocus = (event) => {
        this.canvas.removeEventListener("mousemove", this.handleDraw);
    }
    handleChange = (event) => {
        this.setState({ brushSize: event.target.value });
        document.getElementById('size-info').innerHTML = event.target.value;
    }

    resetCanvas = () => {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        socket.emit('resetCanvas');
    }
    render() {
        return (
            <div className="canvas">
                <div className="top-panel">
                    <span className="round">
                        Round {this.state.round} - {this.state.time}
                    </span>
                </div>
                <div className="game-wrap">
                    {(this.state.roundended) ? < SplashScreen data={this.state.roundended} /> : ''}
                    <canvas id="game" width="880px" height="550px"></canvas>
                </div>
                <div className="selection-panel">
                    <div className="option-group" title="Change brush color">
                        <div id="color-preview"></div>
                        <select name="color-select" id="color-select">
                            <option value="black"></option>
                            <option value="white"></option>
                            <option value="red"></option>
                            <option value="blue"></option>
                            <option value="green"></option>
                            <option value="lime"></option>
                            <option value="yellow"></option>
                            <option value="brown"></option>
                        </select>
                    </div>
                    <div className="option-group" title="Change brush size">
                        <input type="range" min="1" max="100" id="size-slider" value={this.state.brushSize} onChange={this.handleChange} />
                        <span id="size-info">5</span>
                    </div>
                    <div className="option-group">
                        <IoRefreshCircleOutline className="option-icon" id="reset-canvas" onClick={this.resetCanvas} title="Reset canvas" />
                    </div>
                    <div className="draw-theme">{this.state.theme}</div>
                </div>
            </div>
        );
    }
}

export default Canvas;