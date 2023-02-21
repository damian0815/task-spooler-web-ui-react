# adapted from https://maxhalford.github.io/blog/flask-sse-no-deps/
import threading
import time

import flask
from flask_cors import CORS, cross_origin

from message_announcer import MessageAnnouncer
from sse_message_handling import format_message_sse

app = flask.Flask(__name__)
#cors = CORS(app, resources={r"/*": {"origins": "*"}})
cors = CORS(app)

announcer = MessageAnnouncer()

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
            print(f"yielding {msg}")
            yield msg

    print("listening..")
    return flask.Response(stream(), mimetype='text/event-stream')

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
