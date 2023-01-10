import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';

const NO_CONTENT_STATUS_CODE = 204;
export async function customFetch(path, requestInit, defaultErrorMsg, statusCode = 200) {
    const url = createRESTURL(path, {
        app: config.app,
        sharing: 'app',
    });

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }

    if (statusCode === NO_CONTENT_STATUS_CODE) {
        return null;
    }

    const data = await response.json();
    return data;
}
