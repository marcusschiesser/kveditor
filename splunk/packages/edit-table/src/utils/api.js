import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';

export function customFetch(path, requestInit, splunkApp = config.app) {
    const url = createRESTURL(path, {
        app: splunkApp,
        sharing: 'app',
    });
    return fetch(url, requestInit);
}
