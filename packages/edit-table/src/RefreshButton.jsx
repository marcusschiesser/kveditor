import React from 'react';
import { ActionButton } from '@splunk/dashboard-action-buttons';
import Refresh from '@splunk/dashboard-icons/Refresh';
import PropTypes from 'prop-types';

const RefreshButton = ({ itemId, dashboardApi, screenReaderText }) => {
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
