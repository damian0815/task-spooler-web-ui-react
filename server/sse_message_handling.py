import base64

def format_message_sse(data: str, event=None) -> str:
    data_bytes = data.encode('utf-8')
    data_base64_bytes = base64.b64encode(data_bytes)
    data_base64 = data_base64_bytes.decode('ascii')
    event_prefix = "" if event is None else f'event: {event}\n'
    msg = event_prefix + f'data: {data_base64}'
    # 2x \n marks end of message
    msg = msg + '\n\n'
    return msg
