import React from 'react';
import Modal from '@splunk/react-ui/Modal';
import prototype from 'prop-types';

const ModalStyle = {
    minWidth: `500px`,
};

const ModalBodyStyle = {
    padding: 10,
};

export default function AbstractModal({ onClose, open, title, children }) {
    return (
        <Modal onRequestClose={onClose} open={open} style={ModalStyle}>
            <Modal.Header title={title} onRequestClose={onClose} />
            <Modal.Body style={ModalBodyStyle}>{children}</Modal.Body>
        </Modal>
    );
}

AbstractModal.propTypes = {
    onClose: prototype.func.isRequired,
    open: prototype.bool.isRequired,
    title: prototype.string.isRequired,
    children: prototype.node.isRequired,
};
