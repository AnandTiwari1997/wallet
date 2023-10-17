import * as React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import './tab.css';
import { TabProp } from './tab';

interface TabHeaderInfo {
    tabLabel: string;
    tabValue: string;
}

interface SelectedTab {
    tabLabel: string;
    tabValue: string;
}

const Tabs = ({ selectedTab, children, onTabChange, ...props }: { selectedTab?: string; children: ReactElement[]; onTabChange?: (selectedTab: SelectedTab) => void }) => {
    const _getTabHeaderInfo = (): TabProp[] => {
        return children.map((value) => {
            return {
                label: value.props.label,
                value: value.props.value,
                children: value.props.children,
                classes: value.props.classes
            };
        });
    };

    const _getActiveTabContent = () => {
        return children.find((value) => value.props.value === activeTab);
    };

    const [tabHeaders, setTabHeaders] = useState<TabProp[]>([]);
    const [activeTab, setActiveTab] = useState(selectedTab ? selectedTab : tabHeaders[0].value);

    useEffect(() => {
        setTabHeaders(_getTabHeaderInfo());
        if (selectedTab) setActiveTab(selectedTab);
        else setActiveTab(tabHeaders[0].value);
    }, [selectedTab]);

    return (
        <div {...props} className={'tabs-container'}>
            <div className={'tabs--header'}>
                {tabHeaders.map((tabHeaderInfo) => {
                    return (
                        <div
                            aria-label={tabHeaderInfo.label}
                            className={`tab ${activeTab === tabHeaderInfo.value ? 'active--tab' : ''} ${tabHeaderInfo.classes ? tabHeaderInfo.classes : ''}`}
                            onClick={() => {
                                setActiveTab(tabHeaderInfo.value);
                                if (onTabChange)
                                    onTabChange({
                                        tabValue: tabHeaderInfo.value,
                                        tabLabel: tabHeaderInfo.label
                                    });
                            }}
                        >
                            <button className={'tab--label'}>{tabHeaderInfo.label}</button>
                            <div className={'tab--scroller'}></div>
                        </div>
                    );
                })}
            </div>
            {_getActiveTabContent()}
        </div>
    );
};

export default Tabs;