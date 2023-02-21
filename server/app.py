# adapted from https://maxhalford.github.io/blog/flask-sse-no-deps/
import os
import threading
import time

import flask
from flask import Response
from flask_cors import CORS, cross_origin

from message_announcer import MessageAnnouncer
from sse_message_handling import format_message_sse

app = flask.Flask(__name__)
#cors = CORS(app, resources={r"/*": {"origins": "*"}})
cors = CORS(app)

announcer = MessageAnnouncer()

#server = os.environ['TSPW_SSH_SERVER']
#port = int(os.environ['TSPW_SSH_PORT'])
#username = os.environ['TSPW_SSH_USER']
#password = os.environ['TSPW_SSH_PASS']
server = "localhost"
port = 22
username = None
password = None

ts_cmd = "/opt/homebrew/bin/ts"

import paramiko as paramiko


def connect(server, port, username, password):
    # Set up global SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(server, port=port, username=username, password=password)
    chan = ssh.invoke_shell()
    return ssh



@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/ping')
def ping():
    msg = format_message_sse(data='pong')
    announcer.announce(msg=msg)
    return {}, 200

@app.route('/listen', methods=['GET'])
def listen():

    def stream():
        messages = announcer.listen()  # returns a queue.Queue
        while True:
            msg = messages.get()  # blocks until a new message arrives
            #print(f"yielding {msg}")
            yield msg

    print("listening..")
    return flask.Response(stream(), mimetype='text/event-stream')



@app.route('/stream_output', methods=['GET'])
def stream_output():
    ssh_connection = connect(server, port, username, password)
    stdin, stdout, stderr = ssh_connection.exec_command(f"{ts_cmd} -t", get_pty=True)

    print("streaming..")

    def generate():
        print(f"stdout.channel.exit_status_ready(): {stdout.channel.exit_status_ready()}")
        while not stdout.channel.exit_status_ready():
            line = stdout.readline()
            if line:
                yield format_message_sse(line)
            else:
                time.sleep(0.1)
        print(f"ssh process exited with status {stdout.channel.exit_status}")
        print(f"stderr: ", stderr.readlines())

        print("done streaming")
        ssh_connection.close()

    return Response(generate(), mimetype='text/event-stream')



def start_ticker():
    def run_ticker():
        run_seconds = 0
        while True:
            announcer.announce(format_message_sse(f'ticker has been running for {run_seconds} seconds'))
            time.sleep(1)
            run_seconds += 1

    thread = threading.Thread(target=run_ticker, daemon=True)
    thread.start()


start_ticker()
