import React, { useCallback, useEffect, useState } from "react";
import TaskSpoolerInterface from "src/TaskSpoolerInterace";

class TaskSpoolerQueueProps {
    taskSpoolerInterface: TaskSpoolerInterface
}

function TaskSpoolerQueue(props: TaskSpoolerQueueProps) {

    console.log("in taskspoolerqueue")
    const [tasks, setTasks] = useState([]);
    
    const getQueueAsync = useCallback(async () => {
        console.log("getQueueAsync running")
        setTasks(await props.taskSpoolerInterface.getQueueAsync());

    }, [props.taskSpoolerInterface]);

    useEffect(() => { 
        getQueueAsync();
    }, [getQueueAsync]);

    async function moveUp(taskId: number) {
        const index = tasks.findIndex((t) => t.id===taskId);
        if (index > 0) {
            const prevTaskId = tasks[index+1].id;
            const result = await props.taskSpoolerInterface.swapQueuePosition(taskId, prevTaskId);  
            console.log("moveUp result: ", result)
        }
    }

    async function moveDown(taskId: number) {
        const index = tasks.findIndex((t) => t.id===taskId);
        if (index < tasks.length-2) {
            const nextTaskId = tasks[index+1].id;
            const result = props.taskSpoolerInterface.swapQueuePosition(taskId, nextTaskId);  
            console.log("moveDown result: ", result)
        }
    }

    return <div>
        <table>
            <thead>
                <tr>
                    <th>↕</th>
                    <th>id</th>
                    <th>state</th>
                    <th>errorlevel</th>
                    <th>times</th>
                    <th>command</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map(task => (
                    <tr key={task.id} >
                        <span>
                            <button onClick={()=>moveUp(task.id)}>ꜛ</button>
                            <button onClick={()=>moveDown(task.id)}>ꜜ</button>
                        </span>
                        <TaskTableRowCells task={task} />
                    </tr>
                ))}
            </tbody>
        </table>

    </div>

}


class TaskProps {
    task
}

function TaskTableRowCells(props: TaskProps) {
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