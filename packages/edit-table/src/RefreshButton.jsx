import React, { useEffect } from 'react';
import { ActionButton } from '@splunk/dashboard-action-buttons';
import Refresh from '@splunk/dashboard-icons/Refresh';
import PropTypes from 'prop-types';
import { useDashboardApi } from './DashboardApiContext';

const RefreshButton = ({ itemId, dashboardApi, screenReaderText }) => {
    const { setApi } = useDashboardApi();
    useEffect(() => {
        setApi(dashboardApi);
    }, [dashboardApi, setApi]);

    const handleOnClick = () => {
        if (!dashboardApi || !itemId) {
            return;
        }
        dashboardApi.refreshVisualization(itemId);
    };

    return (
        <ActionButton
            data-test="RefreshButton" // for testing
            onClick={handleOnClick}
            icon={<Refresh screenReaderText={screenReaderText} />} // icon for this button
        />
    );
};

RefreshButton.propTypes = {
    itemId: PropTypes.string,
    dashboardApi: PropTypes.object,
    screenReaderText: PropTypes.string,
};

export default RefreshButton;
