import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import TaskSpoolerInterface from "src/TaskSpoolerInterace";
import EdiText from 'react-editext';

class TaskSpoolerQueueProps {
    taskSpoolerInterface: TaskSpoolerInterface
    setActiveTaskId: Dispatch<SetStateAction<number>>
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
            const prevTaskId = tasks[index-1].id;
            const updatedTasks = await props.taskSpoolerInterface.swapQueuePosition(taskId, prevTaskId);  
            setTasks(updatedTasks)
        }
    }

    async function moveDown(taskId: number) {
        const index = tasks.findIndex((t) => t.id===taskId);
        if (index < tasks.length-1) {
            const nextTaskId = tasks[index+1].id;
            const updatedTasks = await props.taskSpoolerInterface.swapQueuePosition(taskId, nextTaskId);
            setTasks(updatedTasks)
        }
    }

    async function kill(taskId: number) {
        const updatedTasks = await props.taskSpoolerInterface.killRunningTask(taskId);
        setTasks(updatedTasks)
    }

    async function remove(taskId: number) {
        const updatedTasks = await props.taskSpoolerInterface.removeQueuedTask(taskId);
        setTasks(updatedTasks)
    }

    async function setCommand(taskId: number, newCommand: string) {
        const updatedTasks = await props.taskSpoolerInterface.setCommand(taskId, newCommand);
        setTasks(updatedTasks);
    }

    async function addTask(command: string) {
        console.log("adding", command);
        const updatedTasks = await props.taskSpoolerInterface.addTask(command);
        setTasks(updatedTasks);
    }

    const [newTaskCommand, setNewTaskCommand] = useState("");

    return <div>
        <form className="addTask">
            <input type="text" 
                placeholder="enter command to enqueue" 
                value={newTaskCommand}
                onChange={(e) => {
                    setNewTaskCommand(e.target.value); 
                }} />
            <input className="submit" 
                type="submit" 
                value="enqueue" 
                onClick={(e) => {
                    addTask(newTaskCommand);
                    e.preventDefault();
                }}/>
        </form>

        <table cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    <th>↕</th>
                    <th>state</th>
                    <th>command</th>
                    <th>errorlevel</th>
                    <th>times</th>
                    <th>id</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map((task, index) => (
                    <tr className="task" key={task.id} onClick={(e) => props.setActiveTaskId(task.id)} >
                        <td className="taskButtons">
                            {(task.state === 'running') && 
                                <button className="kill" onClick={() => kill(task.id)}
                                    >💀</button>
                            }
                            
                            {(task.state === 'queued') && 
                                <button className="remove" onClick={() => remove(task.id)}
                                        disabled={(task.state !== 'queued')}
                                    >❌</button>
                            }

                            <button className="moveUp" onClick={() => moveUp(task.id)}
                                    disabled={!(task.state === 'queued' && (index>1 || tasks[0].state !== 'running'))}
                                >🔼</button>

                            <button className="moveDown" onClick={() => moveDown(task.id)}
                                    disabled={!(task.state === 'queued' && (index<tasks.length-1) && tasks[index+1].state === 'queued')}
                                >🔽</button>
                        </td>
                        <TaskTableRowCells task={task} onEditCommand={(newCommand) => (setCommand(task.id, newCommand))} />
                    </tr>
                ))}
            </tbody>
        </table>

    </div>

}


class TaskProps {
    task
    onEditCommand
}

function TaskTableRowCells(props: TaskProps) {

    function handleCommandEdit(newText) {
        props.onEditCommand(newText)
    }

    const isEditable = (props.task.state === "queued")

    let stateDisplayStr:string = "";
    const t = props.task;
    switch (t.state) {
        case "running":
            stateDisplayStr = "🏃"; break;
        case "queued":
            stateDisplayStr = "⏳"; break;
        case "finished":
            stateDisplayStr = "✔️"; break;
        default:
            stateDisplayStr = t.state;
    }

    return <>
        <td className='state'>{stateDisplayStr}</td>
        <td className='command'>
            {isEditable ? <EdiText 
                type="text" 
                value={t.command} 
                onSave={handleCommandEdit} 
            /> : t.command }
            </td>
        <td className='errorlevel'>{t.errorlevel}</td>
        <td className='times'>{t.times}</td>
        <td className='id'>{t.id}</td>
    </>
}





export default TaskSpoolerQueue;