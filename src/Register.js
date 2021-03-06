import React, { useState, useEffect } from 'react';
import { Link, Redirect } from "react-router-dom";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = { nick: '', server: 'Server-1' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        if (event.target) {
            switch (event.target.tagName) {
                case 'INPUT':
                    this.setState({ nick: event.target.value });
                    break;
                case 'SELECT':
                    this.setState({ server: event.target.value });
                    break;
            }
        }
    }

    handleSubmit(event) {
        if (this.state.nick) {
            localStorage.setItem('nick', this.state.nick);
            localStorage.setItem('server', this.state.server);
        } else {
            event.preventDefault();
        }
    }
    render() {
        return (
            <div className="register">
                <main>
                    <div className="header">
                        <p className="title">Guess draw</p>
                        <div className="form-group">
                            <label htmlFor="nick">Nick</label>
                            <input type="text" id="nick-input" placeholder="babel123" name="nick" value={this.state.nick} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="server">Server</label>
                            <select name="server" value={this.state.server} onChange={this.handleChange} >
                                <option value="Server-1" selected>Server 1</option>
                                <option value="Server-2">Server 2</option>
                                <option value="Server-3">Server 3</option>
                            </select>
                        </div>

                        <Link to="/play" onClick={this.handleSubmit}>Play</Link>
                    </div>
                </main>
            </div>
        );
    }
}

export default Register;