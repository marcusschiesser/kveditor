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
    const path = `kvstore/backup/create`;
    const requestInit = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            archiveName: `kv_store_backup_${collection}`,
            appName: splunkApp,
            collectionName: collection,
        }),
    };

    // const url = createRESTURL(path, {
    //     app: splunkApp,
    //     owner: 'nobody',
    // });
    const url = `http://127.0.0.1:18000/en-US/services/kvstore/backup/create`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Splunk-Form-Key': config.CSRFToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `archiveName=sampleArchive&appName=${splunkApp}&collectionName=${collection}`
        // body: JSON.stringify({
        //     archiveName: `kv_store_backup_${collection}`,
        //     appName: splunkApp,
        //     collectionName: collection,
        // }),
        // headers: {
        //     Authorization: 'Basic ' + btoa('admin:changed'),
        //     'Content-Type': 'application/x-www-form-urlencoded',
        // },
        // body: 'archiveName=sampleArchive&appName=search&collectionName=testcollection',
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
