import * as React from 'react';
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import './tab.css';

interface TabHeaderInfo {
    tabLabel: string;
    tabValue: string;
}

interface SelectedTab {
    tabValue: string;
}

export interface TabProp {
    label: ReactNode;
    value: string;
    children: any;
    classes?: string;
    badge?: boolean;
}

const Tabs = ({
    selectedTab,
    children,
    onTabChange,
    ...props
}: {
    selectedTab?: string;
    children: ReactElement[];
    onTabChange?: (selectedTab: SelectedTab) => void;
}) => {
    const selectedElement = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(0);
    const [left, setLeft] = useState<number>(0);

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
        if (selectedTab) {
            setActiveTab(selectedTab);
        } else {
            setActiveTab(tabHeaders[0].value);
        }
    }, [children, selectedTab]);

    useEffect(() => {
        setTimeout(() => {
            const ref = document.getElementById(activeTab);
            setWidth(ref?.offsetWidth || 0);
            setLeft(ref?.offsetLeft || 0);
        }, 10);
        const resizeEvent = (ev: any) => {
            setTimeout(() => {
                const ref = document.getElementById(activeTab);
                setWidth(ref?.offsetWidth || 0);
                setLeft(ref?.offsetLeft || 0);
            }, 10);
        };
        window.addEventListener('resize', resizeEvent);
        return () => window.removeEventListener('resize', resizeEvent);
    }, [activeTab]);

    return (
        <div {...props} className={'tabs-container'}>
            <div className={'tabs-header-container'}>
                <div className={'tabs-header'}>
                    {tabHeaders.map((tabHeaderInfo: TabProp, index: number) => {
                        return (
                            <div
                                id={`${tabHeaderInfo.value}`}
                                ref={tabHeaderInfo.value === activeTab ? selectedElement : null}
                                className={`tab ${activeTab === tabHeaderInfo.value ? 'active--tab' : ''} ${
                                    tabHeaderInfo.classes ? tabHeaderInfo.classes : ''
                                }`}
                                onClick={(event) => {
                                    setActiveTab(tabHeaderInfo.value);
                                    if (onTabChange) {
                                        onTabChange({
                                            tabValue: tabHeaderInfo.value
                                        });
                                    }
                                }}
                            >
                                <button
                                    className={`tab--label ${
                                        index < tabHeaders.length - 1 ? 'tab--label-separator' : ''
                                    }`}
                                >
                                    {<>{tabHeaderInfo.label}</>}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div
                    className={'tab--scroller'}
                    style={{
                        width: width,
                        left: left
                    }}
                ></div>
            </div>

            {_getActiveTabContent()}
        </div>
    );
};

export default Tabs;
