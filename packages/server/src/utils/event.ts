import { EventEmitter } from 'node:events';

class EventCenter extends EventEmitter {
    constructor() {
        super();
    }
}

/** Event Center event - sse-send */
export const EV_SSE_SEND = 'sse-send';

/** SSE event - connected */
export const SSE_EVENT_CONNECTED = 'connected';
/** SSE event - get_token_start */
export const SSE_EVENT_GET_TOKEN_START = 'get_token_start';
/** SSE event - get_token_end */
export const SSE_EVENT_GET_TOKEN_END = 'get_token_end';

export const eventCenter = new EventCenter();
