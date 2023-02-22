import React from 'react';
import TaskSpoolerInterface from '../TaskSpoolerInterace';
import StreamReceiver from './StreamReceiver';

class TaskOutputProps {
    taskSpoolerInterface: TaskSpoolerInterface
    taskId: number|undefined
}

export function TaskOutput(props: TaskOutputProps) {

    if (props.taskId === undefined) {
        return <div>No task</div>
    }

    const url = props.taskSpoolerInterface.getListenUrlForTask(props.taskId);
    return <StreamReceiver url={url} />

}

export default TaskOutput