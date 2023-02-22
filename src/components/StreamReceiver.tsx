import React, { useEffect, useRef, useState } from "react";

class StreamReceiverProps {
    url: URL;
    max_lines?: number|undefined;
}


function useTraceUpdate(props) {
    const prev = useRef(props);
    useEffect(() => {
      const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
        if (prev.current[k] !== v) {
          ps[k] = [prev.current[k], v];
        }
        return ps;
      }, {});
      if (Object.keys(changedProps).length > 0) {
        console.log('Changed props:', changedProps);
      }
      prev.current = props;
    });
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  

function StreamReceiver(props: StreamReceiverProps) {

    useTraceUpdate(props);

    const max_lines = props.max_lines;
    console.log("reloaded streamReceiver");

    const [lines, setLines] = useState([]);
    useEffect(() => {
        const eventSource = new EventSource(props.url);
        eventSource.onmessage = (e) => {
            const newLines = (e.data as string).split("\n");
            if (!arraysEqual(newLines, lines)) {
                if (max_lines === undefined) {
                    setLines(l => ([...l, newLines]))
                } else {
                    setLines(l => (
                        [...l.slice(-max_lines), newLines])
                    );
                }
            }
        }
        return () => {
          eventSource.close();
        };
      }, [props.url, max_lines]);

    return <pre className="streamReceiverOutput">
        {lines.join("\n")}
    </pre>;
}

export default StreamReceiver;
