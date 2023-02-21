import React, { useEffect, useState } from "react";

class TaskSpoolerQueueProps {
    baseUrl: URL
}

function TaskSpoolerQueue(props: TaskSpoolerQueueProps) {

    const queueUrl = new URL('queue', props.baseUrl);
    const [tasks, setTasks] = useState([]);
    
    function getQueueAsync() {
        return fetch(queueUrl)
        .then((response) => response.json())
        .then((responseJson) => {
            setTasks(responseJson);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => { 
        getQueueAsync()
    });

    return <div>
        <table>
            <tr>
                <th>id</th>
                <th>state</th>
                <th>errorlevel</th>
                <th>times</th>
                <th>command</th>
            </tr>
            {tasks.map(task => (
                <tr key={task.id}>
                    <Task task={task} />
                </tr>
            ))}
        </table>
    </div>

}


class TaskProps {
    task
}

function Task(props: TaskProps) {
    const t = props.task;
    return <>
        <td className='id'>{t.id}</td>
        <td className='state'>{t.state}</td>
        <td className='errorlevel'>{t.errorlevel}</td>
        <td className='times'>{t.times}</td>
        <td className='command'>{t.command}</td>
    </>
}





export default TaskSpoolerQueue;