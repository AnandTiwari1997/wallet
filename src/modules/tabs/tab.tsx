import * as React from 'react';

import { TabProp } from './tabs';

const Tab = ({ label, value, children, badge, classes }: TabProp) => {
    return <div className={'tab--content'}>{children}</div>;
};

export default Tab;
