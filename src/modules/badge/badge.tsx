import './badge.css';
import React from 'react';

export interface BadgeProp {
    badgeContent: any;
    anchorOrigin: {
        vertical: string;
        horizontal: string;
    };
    children: any;
}

const Badge = ({ children, badgeContent, anchorOrigin }: BadgeProp) => {
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
