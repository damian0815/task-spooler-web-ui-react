# adapted from https://maxhalford.github.io/blog/flask-sse-no-deps/


import queue


class MessageAnnouncer:

    def __init__(self):
        self.listeners = []

    def listen(self):
        q = queue.Queue(maxsize=5)
        self.listeners.append(q)
        return q

    def announce(self, msg):
        for i in reversed(range(len(self.listeners))):
            try:
                #print(f"sending msg of len {len(msg)} to listener {i}")
                self.listeners[i].put_nowait(msg)
            except queue.Full:
                #print(f"queue full, deleting listener {i}")
                del self.listeners[i]