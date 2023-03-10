import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { customFetch } from './utils/api';

async function updateKVEntry(collection, key, data, defaultErrorMsg, splunkApp = config.app) {
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
    const response = await customFetch(path, requestInit, splunkApp);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

async function getAllKVEntries(collection, defaultErrorMsg, splunkApp = config.app) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    const response = await customFetch(path, requestInit, splunkApp);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

async function deleteAllKVEntries(collection, defaultErrorMsg, splunkApp = config.app) {
    const path = `storage/collections/data/${collection}`;
    const requestInit = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    };
    const response = await customFetch(path, requestInit, splunkApp);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    return null;
}

async function batchInsertKVEntries(collection, data, defaultErrorMsg, splunkApp = config.app) {
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
    const response = await customFetch(path, requestInit, splunkApp);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    return responseData;
}

async function backupKVStore(collection, defaultErrorMsg, splunkApp = config.app) {
    // const path = `kvstore/backup/create`;
    // const requestInit = {
    //     method: 'POST',
    //     credentials: 'include',
    //     headers: {
    //         'X-Splunk-Form-Key': config.CSRFToken,
    //         'X-Requested-With': 'XMLHttpRequest',
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         archiveName: `kv_store_backup_${collection}`,
    //         appName: splunkApp,
    //         collectionName: collection,
    //     }),
    // };

    const response = await fetch('http://127.0.0.1:18000/services/search/jobs', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: 'search=search *',
    });
    console.log('Response', response);
    if (!response.ok) {
        throw new Error(response.statusText || defaultErrorMsg);
    }
    const responseData = await response.json();
    console.log('Data', responseData);
    return responseData;
}

export { updateKVEntry, getAllKVEntries, deleteAllKVEntries, batchInsertKVEntries, backupKVStore };
