import React from "react";
import StreamReceiver from "components/StreamReceiver";
import TaskSpoolerQueue from './components/TaskSpoolerQueue';

const BASE_URL = new URL("http://localhost:5001/")
const TICKER_URL = new URL("listen", BASE_URL);
const TSP_URL = new URL("stream_output", BASE_URL);

const App: React.FC = () => (
    <div>
        <TaskSpoolerQueue baseUrl={BASE_URL} />
        <StreamReceiver url={TICKER_URL} />
        <StreamReceiver url={TSP_URL} />
    </div>
);

export default App;
