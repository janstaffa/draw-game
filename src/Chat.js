import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Message from './Message';

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            server: localStorage.getItem('server'),
            nick: localStorage.getItem('nick'),
            players: 0
        }
    }
    send = () => {
        const input = document.getElementById('input');
        socket.emit('chat', { nick: localStorage.getItem('nick'), content: input.value });
        input.value = '';
    }

    scrollDown() {
        const feed = document.querySelector('.feed');
        feed.scrollTop = feed.scrollHeight;
    }
    banChat() {
        const el = document.querySelector('.message-input');
        el.style.pointerEvents = 'none';
    }
    allowChat() {
        const el = document.querySelector('.message-input');
        el.style.pointerEvents = 'all';
    }

    componentDidMount() {
        socket.emit('join', { room: this.state.server, nick: this.state.nick });

        socket.on('server', (data) => {
            let messages = [...this.state.messages];
            let msg = { server: true, content: data.content, timestamp: data.timestamp, color: data.color }
            messages.push(msg);
            this.setState({ messages, players: data.players });

            this.scrollDown();
        });
        socket.on('chat', (data) => {
            let messages = [...this.state.messages];
            messages.push(data);
            this.setState({ messages });
        });
        socket.on('allowDraw', (data) => {
            this.banChat();
        });

        socket.on('roundStart', () => {
            this.allowChat();
        });

        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            e.returnValue = '';
        });


        const input = document.getElementById('input');
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.send();
            }
        });
    }
    render() {
        return (
            <div className="chat" >
                <div className="status">
                    <div className="server">
                        {this.state.server}
                    </div>
                    <div className="people">
                        {this.state.players}/10
                    </div>
                </div>
                <div className="feed">
                    {
                        this.state.messages.map((message, index) => (
                            <Message data={message} key={index} />
                        ))
                    }
                </div>

                <div className="message-input">
                    <input type="text" id="input" />
                    <button onClick={this.send}>Send</button>
                </div>
            </div>

        );

    }
}

export default Chat;