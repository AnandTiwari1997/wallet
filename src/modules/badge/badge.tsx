import './badge.css';
import React from 'react';

const Badge = ({
    children,
    badgeContent,
    anchorOrigin
}: {
    children: any;
    badgeContent: any;
    anchorOrigin?: {
        vertical: string;
        horizontal: string;
    };
}) => {
    return (
        <>
            <span className={'badge-root'}>
                {children}
                <span className={`badge-label ${anchorOrigin ? `badge-position-${anchorOrigin.vertical}-${anchorOrigin.horizontal}` : ''}`}>{badgeContent}</span>
            </span>
        </>
    );
};

export default Badge;
