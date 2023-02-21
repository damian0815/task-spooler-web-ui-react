def format_message_sse(data: str, event=None) -> str:
    event_prefix = "" if event is None else f'event: {event}\n'
    msg = event_prefix + f'data: {data}'
    # 2x \n marks end of message
    msg = msg + '\n\n'
    return msg
