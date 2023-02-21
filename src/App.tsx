import React from "react";
import HelloWorld from "components/HelloWorld";
import StreamReceiver from "components/StreamReceiver";

const TICKER_URL = new URL("http://localhost:5001/listen");
const TSP_URL = new URL("http://localhost:5001/stream_output");

const App: React.FC = () => (
    <div>
        <HelloWorld />
        <StreamReceiver url={TICKER_URL} />
        <StreamReceiver url={TSP_URL} />
    </div>
);

export default App;
