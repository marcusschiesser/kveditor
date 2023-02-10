import React from 'react';

import DashboardCore from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import { EditTable, RefreshButton, DashboardApiProvider } from '@marcusschiesser/edit-table';

import definition from './definition.json';

const themeToVariant = {
    enterprise: { colorScheme: 'light', family: 'enterprise' },
    enterpriseDark: { colorScheme: 'dark', family: 'enterprise' },
    prisma: { colorScheme: 'dark', family: 'prisma' },
};

// use DashboardCore to render a simple dashboard
const customPreset = {
    ...EnterpriseViewOnlyPreset,
    visualizations: {
        ...EnterpriseViewOnlyPreset.visualizations,
        'splunk.EditTable': EditTable,
    },
};

const DashboardExample = () => {
    return (
        <SplunkThemeProvider {...themeToVariant.prisma}>
            <DashboardContextProvider>
                <DashboardApiProvider>
                    <DashboardCore
                        width="100%"
                        height="100%"
                        preset={customPreset}
                        definition={definition}
                        actionMenus={[<RefreshButton key="refresh" />]}
                    />
                </DashboardApiProvider>
            </DashboardContextProvider>
        </SplunkThemeProvider>
    );
};

export default DashboardExample;
