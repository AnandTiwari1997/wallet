import './chip.css';
import React from 'react';

const Chip = ({ label, variant }: { label: string; variant: string }) => {
    return (
        <>
            <div className={`chip-root chip-${variant}`}>
                <span className={'chip-label'}>{label}</span>
            </div>
        </>
    );
};

export default Chip;
