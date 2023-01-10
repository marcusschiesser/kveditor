import * as config from '@splunk/splunk-utils/config';
import { customFetch } from './utils/api';

function updateKVEntry(collection, key, data, defaultErrorMsg) {
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
    return customFetch(path, requestInit, defaultErrorMsg, 200);
}

function getAllKVEntries(collection, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    return customFetch(path, requestInit, defaultErrorMsg, 200);
}

function deleteAllKVEntries(collection, defaultErrorMsg) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    return customFetch(path, requestInit, defaultErrorMsg, 204);
}

function batchInsertKVEntries(collection, data, defaultErrorMsg) {
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
    return customFetch(path, requestInit, defaultErrorMsg, 201);
}

export { updateKVEntry, getAllKVEntries, deleteAllKVEntries, batchInsertKVEntries };
