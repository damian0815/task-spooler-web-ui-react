import React, { useEffect, useState } from "react";

class StreamReceiverProps {
    url: URL;
}

function StreamReceiver(props: StreamReceiverProps) {

    const [lastMessage, setLastMessage] = useState("nothing");
    useEffect(() => {
        const eventSource = new EventSource(props.url);
        eventSource.onmessage = (e) => {
            setLastMessage(e.data);
        }
        return () => {
          eventSource.close();
        };
      }, [props.url]);

    return <div>eventy: 
        {lastMessage}
    </div>;
}

export default StreamReceiver;
