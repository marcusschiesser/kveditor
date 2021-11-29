import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DashboardApiContext = React.createContext();

const DashboardApiProvider = ({ children }) => {
    const [api, setApi] = useState();
    return (
        <DashboardApiContext.Provider
            value={{
                api,
                setApi
            }}
        >
            {children}
        </DashboardApiContext.Provider>
    );
};

DashboardApiProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

const useDashboardApi = () => {
    const context = React.useContext(DashboardApiContext);
    if (context === undefined) {
        throw new Error('useDashboardApi must be used within a DashboardApiProvider');
    }
    return context;
};

export { DashboardApiProvider, useDashboardApi };
