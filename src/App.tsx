import React from "react";
import "./components/css/App.css"
import TaskSpoolerQueue from './components/TaskSpoolerQueue';
import TaskSpoolerInterface from './TaskSpoolerInterace';
import { useState } from 'react';
import TaskOutput from "components/TaskOutput";
import { useTraceUpdate } from "./utils";

const BASE_URL = new URL("http://localhost:5001/")
const taskSpoolerInterface = new TaskSpoolerInterface(BASE_URL);
const TICKER_URL = new URL("listen", BASE_URL);
const TSP_URL = new URL("stream_output", BASE_URL);

export function App() {

    useTraceUpdate({});

    const [activeTaskId, setActiveTaskId] = useState<number|undefined>();

    return <div>
        <TaskSpoolerQueue taskSpoolerInterface={taskSpoolerInterface} setActiveTaskId={setActiveTaskId}/>
        <TaskOutput taskSpoolerInterface={taskSpoolerInterface} taskId={activeTaskId} />
        {/*<StreamReceiver url={TICKER_URL} />
        <StreamReceiver url={TSP_URL} />*/}
    </div>
};

export default App;
