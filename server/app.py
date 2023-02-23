# adapted from https://maxhalford.github.io/blog/flask-sse-no-deps/
import json
import threading
import time

import flask
from flask import Response, request
from flask_cors import CORS

from message_announcer import MessageAnnouncer
from tsp_manager import TaskSpooler
from sse_message_handling import format_message_sse

app = flask.Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

announcer = MessageAnnouncer()

ts_cmd = "/opt/homebrew/bin/ts"


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


@app.route('/queue', methods=['GET'])
def queue():
    tsp = TaskSpooler(ts_cmd)
    tasks = tsp.queue
    return Response(json.dumps([t.__dict__ for t in tasks]), mimetype='application/json')

@app.route('/execute_tsp_subcommand', methods=['GET'])
def execute_tsp_subcommand():

    subcommand = request.args.get('cmd', None)
    refresh_queue = request.args.get('refresh_queue', False)
    if subcommand is None:
        return Response('{"error": "missing cmd"}', mimetype='application/json', status=400)

    tsp = TaskSpooler(tsp_command=ts_cmd)
    result = tsp.execute_tsp(subcommand, refresh_queue=refresh_queue)
    result_json = {
        'stdout': result[0],
    }
    if result[1] is not None:
        result_json['tasks'] = result[1]
    return result_json


@app.route('/stream_output', methods=['GET'])
def stream_output():
    task_id = request.args.get('taskId', None)
    subcommand = "-c" if request.args.get('fetchFullOutput', '0') == '1' else "-t"
    stopMarker = request.args.get('stopMarker', None)
    if task_id is None:
        return Response('{"error": "missing taskId"}', mimetype='application/json', status=400)

    tsp = TaskSpooler(tsp_command=ts_cmd)
    stdout_lineses = tsp.stream_tsp(f"{subcommand} {task_id}")
    print("streaming..")
    def generate():
        for lines in stdout_lineses:
            formatted = format_message_sse("".join(lines))
            #print("-> yielding", formatted)
            yield formatted
        if stopMarker is not None:
            yield format_message_sse(stopMarker)

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
