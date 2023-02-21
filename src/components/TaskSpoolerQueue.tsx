import React, { useEffect } from "react";

class TaskSpoolerQueueProps {
    baseUrl: URL
}

function TaskSpoolerQueue(props: TaskSpoolerQueueProps) {

    const queueUrl = new URL('queue', props.baseUrl);
    
    function getQueueAsync() {
        return fetch(queueUrl)
        .then((response) => response.json())
        .then((responseJson) => {
            //setTasks(responseJson);
            return responseJson;
        })
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => { 
        const fetchQueue = async () => {
            const tasks = await getQueueAsync();
            //setTasks(tasks);
            console.log(tasks);
        }
        fetchQueue()
        .catch(console.error)
    });

    return <div>
        tasks list here
    </div>

}




export default TaskSpoolerQueue;