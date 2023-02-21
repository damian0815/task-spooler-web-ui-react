import React, { useEffect, useState } from "react";

class StreamReceiverProps {
    url: URL;
    max_lines? = 10;
}

function StreamReceiver(props: StreamReceiverProps) {

    const max_lines = props.max_lines ?? 10;

    const [lines, setLines] = useState([]);
    useEffect(() => {
        const eventSource = new EventSource(props.url);
        eventSource.onmessage = (e) => {
            const newLines = (e.data as string).split("\n");
            setLines(l => (
                [...l.slice(-max_lines ?? 10), newLines])
            );
        }
        return () => {
          eventSource.close();
        };
      }, [props.url, max_lines]);

    return <div>eventy: 
        <pre>
        {lines.join("\n")}
        </pre>
    </div>;
}

export default StreamReceiver;
