import React from "react";
import StreamReceiver from "components/StreamReceiver";
import TaskSpoolerQueue from './components/TaskSpoolerQueue';
import TaskSpoolerInterface from './TaskSpoolerInterace';

const BASE_URL = new URL("http://localhost:5001/")
const taskSpoolerInterface = new TaskSpoolerInterface(BASE_URL);
const TICKER_URL = new URL("listen", BASE_URL);
const TSP_URL = new URL("stream_output", BASE_URL);

const App: React.FC = () => (
    <div>
        <TaskSpoolerQueue taskSpoolerInterface={taskSpoolerInterface} />
        <StreamReceiver url={TICKER_URL} />
        <StreamReceiver url={TSP_URL} />
    </div>
);

export default App;
