import * as config from '@splunk/splunk-utils/config';
import SearchJob from '@splunk/search-job';
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

const executeJob = async (job, errorMessage) => {
    try {
        const response = await job.getResults().toPromise();
        const errorMessages = response?.messages?.filter((msg) => msg.type === 'ERROR');
        if (errorMessages && errorMessages.length > 0) {
            console.error('Execute Job Error From Response', response);
            throw new Error(errorMessages.map((msg) => msg.text).join('\n'));
        }
    } catch (err) {
        console.error('Execute Job Error', err);
        throw new Error(err?.message || errorMessage);
    }
};

const createBackupForKvStore = async (splunkApp, kvStore, errorMessage) => {
    const backupJob = SearchJob.create(
        { search: `|inputlookup ${kvStore} |outputlookup ${kvStore}.bak.csv` },
        { app: splunkApp }
    );
    return executeJob(backupJob, errorMessage);
};

const restoreKvStoreFromBackup = async (splunkApp, kvStore, errorMessage) => {
    const restoreJob = SearchJob.create(
        {
            search: `|inputlookup ${kvStore}.bak.csv |outputlookup ${kvStore}`,
        },
        { app: splunkApp }
    );
    return executeJob(restoreJob, errorMessage);
};

export {
    updateKVEntry,
    getAllKVEntries,
    deleteAllKVEntries,
    batchInsertKVEntries,
    createBackupForKvStore,
    restoreKvStoreFromBackup,
};
