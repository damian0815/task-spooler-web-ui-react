import { exec } from "child_process";


export class TaskSpoolerInterface {

    baseUrl: URL

    constructor(baseUrl: URL) {
        this.baseUrl = baseUrl;
    }

    async executeTspSubcommand(subcommand: string, refreshQueue: boolean) {
        const execUrl = new URL('execute_tsp_subcommand', this.baseUrl);
        execUrl.searchParams.set("cmd", subcommand);
        execUrl.searchParams.set("refresh_queue", ""+refreshQueue);
        return fetch(execUrl)
        .then((response) => response.json())
        .catch((error) => {
            console.error(error);
        });
    }

    async getQueueAsync() {
        const queueUrl = new URL('queue', this.baseUrl);

        return fetch(queueUrl)
        .then((response) => response.json())
        .then((responseJson) => {
            return responseJson;
        })
        .catch((error) => {
            console.error(error);
        });
    }

    getListenUrlForTask(taskId: number, stopMarker: string|undefined) : URL {
        const url = new URL('stream_output', this.baseUrl)
        url.searchParams.set('taskId', "" + taskId)
        url.searchParams.set('fetchFullOutput', "1"); 
        if (stopMarker) {
            url.searchParams.set('stopMarker', stopMarker);
        }
        return url;
    }

    async killRunningTask(taskId: number) {
        return this.executeTspSubcommand("-k " + taskId, true)
            .then((responseJson) => {
                return responseJson['tasks'];
        })
    }

    async swapQueuePosition(idA: number, idB: number) {
        return this.executeTspSubcommand("-U " + idA + "-" + idB, true)
            .then((responseJson) => {
                return responseJson['tasks'];
            });
    }

    async removeQueuedTask(id: number) {
        return this.executeTspSubcommand("-r " + id, true)
            .then((responseJson) => {
                return responseJson['tasks'];
            })
    }

    async addTask(command: string) {
        return this.executeTspSubcommand(command, true)
            .then((responseJson) => {
                return responseJson['tasks'];
            })
    }

    async setCommand(id: number, command: string) {

        // setCommand means:
        // 1. Add the new command
        // 2. Swap new command and existing
        // 3. Remove existing

        // 1. add the new command
        return this.addTask(command)
            .then((responseJson) => {
                console.log("addded task '", command, "', response: ", responseJson);

                const newId = parseInt(responseJson["stdout"][0]);
                return this.swapQueuePosition(id, newId);
            })
            .then((responseJson) => {
                console.log("swapped positions, response: ", responseJson);

                return this.removeQueuedTask(id);
            })
            .then((responseJson) => {
                console.log("done, response: ", responseJson)
                return responseJson;
            })

    }

}


export default TaskSpoolerInterface;