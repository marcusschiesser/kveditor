import * as config from '@splunk/splunk-utils/config';
import { customFetch } from './utils/api';

async function updateKVEntry(collection, key, data, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}/${encodeURIComponent(key)}`;
    const requestInit = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const response = await customFetch(path, requestInit);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

async function getAllKVEntries(collection, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    const response = await customFetch(path, requestInit);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

async function deleteAllKVEntries(collection, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    const response = await customFetch(path, requestInit);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    return null;
}

async function batchInsertKVEntries(collection, data, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}/batch_save`;
    const requestInit = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const response = await customFetch(path, requestInit);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

export { updateKVEntry, getAllKVEntries, deleteAllKVEntries, batchInsertKVEntries };
