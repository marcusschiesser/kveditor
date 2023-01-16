import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';

export function customFetch(path, requestInit) {
    const url = createRESTURL(path, {
        app: config.app,
        sharing: 'app',
    });
    return fetch(url, requestInit);
}
