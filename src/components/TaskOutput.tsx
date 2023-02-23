import React from 'react';
import TaskSpoolerInterface from '../TaskSpoolerInterace';
import StreamReceiver from './StreamReceiver';
import { useTraceUpdate } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';


class TaskOutputProps {
    taskSpoolerInterface: TaskSpoolerInterface
    taskId: number|undefined
}

export function TaskOutput(props: TaskOutputProps) {

    useTraceUpdate(props);

    if (props.taskId === undefined) {
        return <div>No task</div>
    }

    const stopMarker = uuidv4();
    const url = props.taskSpoolerInterface.getListenUrlForTask(props.taskId, stopMarker);
    return <StreamReceiver url={url} stopMarker={stopMarker} />

}

export default TaskOutput