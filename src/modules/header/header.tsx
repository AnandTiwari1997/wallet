import * as React from 'react';
import './header.css';

const Header = ({ heading }: { [key: string]: any }) => {
    return (
        <div className="header-container">
            <div className="header-title">{heading}</div>
        </div>
    );
};

export default Header;
