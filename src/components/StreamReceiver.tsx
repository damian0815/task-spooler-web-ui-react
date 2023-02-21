import React, { useEffect, useState } from "react";

class StreamReceiverProps {
    url: URL;
    max_lines?: number=1024;
}

function StreamReceiver(props: StreamReceiverProps) {

    const [lines, setLines] = useState([]);
    useEffect(() => {
        const eventSource = new EventSource(props.url);
        eventSource.onmessage = (e) => {
            const newLines = (e.data as string).split("\n");
            setLines(l => [...l.slice(0, props.max_lines), newLines]);
        }
        return () => {
          eventSource.close();
        };
      }, [props.url, props.max_lines]);

    return <div>eventy: 
        <pre>
        {lines.join("\n")}
        </pre>
    </div>;
}

export default StreamReceiver;
