import React, { useEffect } from 'react';
import { ActionButton } from '@splunk/dashboard-action-buttons';
import Refresh from '@splunk/dashboard-icons/Refresh';
import PropTypes from 'prop-types';
import { useDashboardApi } from './DashboardApiContext';

const RefreshButton = ({ itemId, dashboardApi, screenReaderText, visible }) => {
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
        <div>
            {visible && (
                <ActionButton
                    visible={visible}
                    data-test="RefreshButton" // for testing
                    onClick={handleOnClick}
                    icon={<Refresh screenReaderText={screenReaderText} />} // icon for this button
                />
            )}
        </div>
    );
};

RefreshButton.propTypes = {
    itemId: PropTypes.string,
    dashboardApi: PropTypes.object,
    screenReaderText: PropTypes.string,
    visible: PropTypes.bool,
};

RefreshButton.defaultProps = {
    visible: false,
};

export default RefreshButton;
