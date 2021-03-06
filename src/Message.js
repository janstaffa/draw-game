const Message = ({ data }) => {
    const getTime = (date) => {
        date = new Date(date);
        const options = {
            hour: "2-digit", minute: "2-digit"
        };
        return date.toLocaleTimeString("cz-cs", options);
    }
    return (
        <div className={'message' + (data.server ? ' server' : '')}>
            <div className="message-info">
                <span className="time">
                    {getTime(data.timestamp)}
                </span>
                    &nbsp;-&nbsp;
                <span className="nick" style={{ color: data.color }}>
                    {data.server ? '' : data.sender}
                </span>
            </div>
            <div className="message-content">
                {data.content}
            </div>
        </div>

    );
}

export default Message;

