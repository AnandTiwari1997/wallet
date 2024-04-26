import './badge.css';
import React from 'react';

type BadgeProp = {
    badgeContent: any;
    anchorOrigin: {
        vertical: string;
        horizontal: string;
    };
    children: any;
} & React.ComponentPropsWithoutRef<'span'>;

const Badge: React.FC<BadgeProp> = ({ children, badgeContent, anchorOrigin, ...props }: BadgeProp) => {
    return (
        <>
            <span className={'badge-root'} key={`${children}_${badgeContent}`} {...props}>
                {children}
                <span
                    className={`badge-label ${
                        anchorOrigin ? `badge-position-${anchorOrigin.vertical}-${anchorOrigin.horizontal}` : ''
                    }`}
                >
                    {badgeContent}
                </span>
            </span>
        </>
    );
};

export default Badge;
