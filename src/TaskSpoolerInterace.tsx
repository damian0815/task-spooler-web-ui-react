

export class TaskSpoolerInterface {

    baseUrl: URL

    constructor(baseUrl: URL) {
        this.baseUrl = baseUrl;
    }


    getQueueAsync() {
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

    swapQueuePosition(idA: number, idB: number) {
        const execUrl = new URL('execute_tsp_subcommand', this.baseUrl);
        execUrl.searchParams.set("cmd", "-U " + idA + "-" + idB);
        return fetch(execUrl)
        .then((response) => response.json())
        .then((responseJson) => {
            return responseJson;
        })
        .catch((error) => {
            console.error(error);
        });
    }

}


export default TaskSpoolerInterface;