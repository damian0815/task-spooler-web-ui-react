import re
from dataclasses import dataclass

import paramiko

@dataclass
class Task:
    id: int
    state: str
    output: str
    errorlevel: int|None
    times: str|None
    command: str

def parse_task_str(task_line: str) -> Task:
    # 2    running    /tmp/ts-out.XW3gF0                         ls
    # 0    finished   /tmp/ts-out.nrRouK -1       0.00/0.00/0.00 ls
    finished_task_split = re.split("^(\d+) +(\S+) +(\S+) +(-?\d+) +(\d+\.\d+/\d+\.\d+/\d+\.\d+) +(.*)$", task_line)
    if len(finished_task_split) > 1:
        # finished task
        id = int(finished_task_split[1])
        state = finished_task_split[2]
        output = finished_task_split[3]
        errorlevel = int(finished_task_split[4])
        times = finished_task_split[5]
        command = finished_task_split[6]
        return Task(id=id, state=state, output=output, errorlevel=errorlevel, times=times, command=command)
    else:
        # running task
        running_task_split = re.split("^(\d+) +(\S+) +(\S+) +(.*)$", task_line)
        id = int(running_task_split[1])
        state = running_task_split[2]
        output = running_task_split[3]
        command = running_task_split[4]
        return Task(id=id, state=state, output=output, errorlevel=None, times=None, command=command)



class TaskSpooler:

    ssh: paramiko.SSHClient
    tsp_command: str

    def __init__(self, ssh: paramiko.SSHClient, tsp_command: str='tsp'):
        self.ssh = ssh
        self.tsp_command = tsp_command

    @property
    def queue(self) -> [Task]:
        lines = self.execute_tsp("-l")[1:]
        print(lines)

        tasks = [parse_task_str(l) for l in lines]
        return tasks

    def execute_tsp(self, args: str) -> tuple[list[str], list[str]]:
        print("executing", args)
        stdin, stdout, stderr = self.ssh.exec_command(f"{self.tsp_command} {args}")
        return stdout.readlines(), stderr.readlines()

