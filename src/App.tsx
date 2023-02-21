import React from "react";
import HelloWorld from "components/HelloWorld";
import StreamReceiver from "components/StreamReceiver";

const SERVER_URL = new URL("http://localhost:5001/listen");

const App: React.FC = () => (
    <div>
        <HelloWorld />
        <StreamReceiver url={SERVER_URL} />
    </div>
);

export default App;
