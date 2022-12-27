import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { handleError, handleResponse } from '@splunk/splunk-utils/fetch';

function updateKVEntry(collection, key, data, defaultErrorMsg) {
    const url = createRESTURL(
        `storage/collections/data/${collection}/${encodeURIComponent(key)}`,
        { app: config.app, sharing: 'app' }
    );
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(handleResponse(200))
    .catch(handleError(defaultErrorMsg))
    .catch((err) => err instanceof Object ? defaultErrorMsg : err); // handleError sometimes returns an Object
}

export { updateKVEntry };
