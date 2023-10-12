import { IncomingHttpHeaders as In } from 'http';

export interface IncomingHttpHeaders extends In {
    'x-consumer-id': string;
    'x-consumer-username': string;
    'x-consumer-custom-id': string;
}
