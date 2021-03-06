const SplashScreen = ({ data }) => {
    const { message, results, theme } = data;
    results.sort((a, b) => (a.score < b.score) ? 1 : -1);

    return (
        <div className="splash-screen">
            <div className="splash-header">
                Game over!
            </div>
            <div className="splash-text">
                <p>{message}</p>
                <p>the theme was: &nbsp;<b>{theme}</b></p>
            </div>
            <div className="splash-leaderboard">
                <p>Leaderboard</p>
                <table>
                    <tbody>
                        {results.map(player => (
                            <tr>
                                <td>{(player.place !== 0) ? player.place + '.' : 'drawer'}</td>
                                <td style={{ color: player.color }}>{player.nick}</td>
                                <td>{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="next-game">
                next game starts in 5s...
            </p>
        </div>
    );
}

export default SplashScreen;

