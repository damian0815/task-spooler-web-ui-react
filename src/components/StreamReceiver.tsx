import React, { useEffect } from "react";

class StreamReceiverProps {
    url: URL;
}

function StreamReceiver(props: StreamReceiverProps) {

    useEffect(() => {
        console.log("listening for events from", props.url);
        const eventSource = new EventSource(props.url);
        eventSource.onmessage = (e) => {
            
            console.log(e.data);
        }
        return () => {
          eventSource.close();
        };
      }, [props.url]);

    return <div>eventy</div>;
}

export default StreamReceiver;
