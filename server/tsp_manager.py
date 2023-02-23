import re
import uuid
from dataclasses import dataclass
from typing import Optional, Any, Callable, Generator
from subprocess import Popen, STDOUT, PIPE, run
import paramiko

@dataclass
class Task:
    id: int
    state: str
    output: str
    errorlevel: int|None
    times: str|None
    command: str

def parse_task_str(task_line: str) -> Task|None:
    print(f"parsing line for task: {task_line}")
    # 2    running    /tmp/ts-out.XW3gF0                         ls
    # 0    finished   /tmp/ts-out.nrRouK -1       0.00/0.00/0.00 ls
    finished_task_split = re.split("^(\d+) +(\S+) +(\S+) +(-?\d+) +(\d+\.\d+/\d+\.\d+/\d+\.\d+) +(.*)$", task_line)
    if len(finished_task_split) == 8:
        # finished task
        id = int(finished_task_split[1])
        state = finished_task_split[2]
        output = finished_task_split[3]
        errorlevel = int(finished_task_split[4])
        times = finished_task_split[5]
        command = finished_task_split[6]
        return Task(id=id, state=state, output=output, errorlevel=errorlevel, times=times, command=command)

    # running task
    running_task_split = re.split("^(\d+) +(\S+) +(\S+) +(.*)$", task_line)
    if len(running_task_split) == 6:
        id = int(running_task_split[1])
        state = running_task_split[2]
        output = running_task_split[3]
        command = running_task_split[4]
        return Task(id=id, state=state, output=output, errorlevel=None, times=None, command=command)

    return None


class TaskSpooler:

    tsp_command: str

    def __init__(self, tsp_command: str='tsp'):
        self.tsp_command = tsp_command

    def exec_command(self, cmd: list[str]):
        print("running ", cmd)
        result = run(cmd, shell=False, stdout=PIPE, text=True)
        lines = result.stdout.split('\n')
        return lines


    @property
    def queue(self) -> [Task]:
        lines, _ = self.execute_tsp("-l")
        print("queue got lines", lines)
        tasks = [parse_task_str(l) for l in lines[1:] if len(l)>0]
        return tasks

    def stream_tsp(self, args: str) -> Generator[str, None, None]:
        full_command_string = f"{self.tsp_command} {args}"
        process = Popen(full_command_string, stdout=PIPE, stderr=STDOUT, shell=True)
        while process.poll() is None:
            line = process.stdout.readline()
            line_decoded = line.decode("iso-8859-1")
            print("yielding", line_decoded.strip())
            yield [line_decoded]
        remaining = process.stdout.readlines()
        yield [l.decode("iso-8859-1") for l in remaining]
        print("stream_tsp done")


    def execute_tsp(self, args: str, refresh_queue: bool=False) -> tuple[list[str], Optional[list[Task]]]:
        #print("executing", args)
        full_command_string = f"{self.tsp_command} {args}"
        marker_uuid = None
        if refresh_queue:
            marker_uuid = uuid.uuid4()
            full_command_string += f"; echo {marker_uuid}; {self.tsp_command} -l"
        #print(f"executing '{full_command_string}'")
        lines = self.exec_command(["bash", "-c", full_command_string])
        if refresh_queue:
            #print(f"looking for {str(marker_uuid)} in {lines}...")
            marker_line_index = next((i for (i, l) in enumerate(lines) if l.strip() == str(marker_uuid)), None)
            stdout_lines = lines[:marker_line_index]
            tasks = [parse_task_str(l) for l in lines[marker_line_index+2:] if len(l)>0]
            return stdout_lines, tasks
        else:
            return (lines, None)

