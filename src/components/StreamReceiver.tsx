import React, { useEffect, useState, useRef } from "react";
import { arraysEqual, useTraceUpdate } from "src/utils";
global.Buffer = global.Buffer || require('buffer').Buffer

class StreamReceiverProps {
    url: URL
    stopMarker: string
    maxLines?: number|undefined
}

const AlwaysScrollToBottom = () => {
    const elementRef = useRef(null);
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

function StreamReceiver(props: StreamReceiverProps) {

    useTraceUpdate(props);

    const maxLines = props.maxLines ?? 16384;

    const linesURL = useRef<URL|undefined>();
    const [lines, setLines] = useState([]);
    const scrollableBox = useRef(null);
    const [pinnedToBottom, setPinnedToBottom] = useState(false);
    const scrollTimeout = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        //console.log("making eventSource")
        const es = new EventSource(props.url);
        es.onmessage = (e) => {
            const dataBase64 = e.data;
            const data = Buffer.from(dataBase64, 'base64').toString();
            //console.log(dataBase64, data);
            let newLines = data.split("\n").filter(l => l);
            if (newLines[newLines.length-1] === props.stopMarker) {
                es.close();
                newLines.splice(newLines.length-1);
            }
            //console.log("after maybe splicing:", newLines);
            if (linesURL.current != props.url) {
                setLines(newLines);
                linesURL.current = props.url;
            } else {
                if (maxLines === undefined) {
                    //console.log("maxLines is undefined")
                    setLines(l => (l.concat(newLines)))
                } else {
                    setLines(l => {
                        //console.log("in onmessage->setLines with ", l.length, "old lines and", newLines.length, "new lines");

                        if (newLines.length > maxLines) {
                            newLines.splice(0, newLines.length - maxLines);
                        }
                        const linesToPreserve = Math.min(l.length, maxLines - newLines.length)
                        //console.log("using", newLines.length, "newLines and keeping", linesToPreserve, "old lines")
                        
                        if (linesToPreserve>0) {
                            const reconstruction = l.slice(-linesToPreserve)
                            //console.log(" ... ", reconstruction.length, " plus ", newLines.length)
                            return reconstruction.concat(newLines)
                        } else {
                            return newLines;
                        }
                    });
                }
            }
        }
        return () => {
            console.log('closing es');
            es.close();
        };
    }, [props.url, linesURL, maxLines]);



    useEffect(() => {
        if (!isScrolling && pinnedToBottom) {
            scrollableBox.current.scrollTo({left: 0, top: scrollableBox.current.scrollHeight, behaviour: "smooth"});
        }
    }, [lines]);


    function enableOrDisableScrollPinning(e) {
        //console.log("scrolled: ", scrollableBox.current.scrollTop + scrollableBox.current.clientHeight, scrollableBox.current.scrollHeight);
        const scrollBottom = scrollableBox.current.scrollTop + scrollableBox.current.clientHeight;
        if (scrollableBox.current.scrollHeight - scrollBottom < 25) {
            //console.log("pinning to bottom")
            setPinnedToBottom(true);
        } else if (scrollableBox.current.scrollHeight - scrollBottom > 50) {
            //console.log("unpinning from bottom")
            setPinnedToBottom(false);
        }

    }

    function enableOrDisableScrollPinningDebouncer(e) {
        setIsScrolling(true);
        const scrollBottom = scrollableBox.current.scrollTop + scrollableBox.current.clientHeight;
        //console.log("delta: ", scrollableBox.current.scrollHeight - scrollBottom)
        if(scrollTimeout.current){
            window.clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = window.setTimeout(() => {
            setIsScrolling(false);
            enableOrDisableScrollPinning(e)
        },300);
    }

    return <div className="streamReceiverContainer">
        <pre className="streamReceiverOutput" 
             ref={scrollableBox}
             onScroll={(e) => enableOrDisableScrollPinningDebouncer(e)} >
            {lines.join("\n")}

        </pre>
    </div>
}

export default StreamReceiver;
