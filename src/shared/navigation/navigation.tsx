import { Button } from 'boxed-material-ui/modules';
import { Colors } from 'boxed-material-ui/theming';
import { angleRight, wallet } from 'icons/icons';
import { IconButton } from 'modules';
import * as React from 'react';
import NavigationItemList from 'shared/navigation/navigation-item-list';
import 'shared/navigation/navigation.css';

type NavigationState = {
    current: string;
    previous: string;
};

type PanelState = {
    collapsed: boolean;
};

type NavigationProps = {
    active: string;
    onNavigation: (state: NavigationState) => void;
    onPanelChange?: (state: PanelState) => void;
};

const Navigation = ({ active, onNavigation, onPanelChange }: NavigationProps) => {
    const activeTabClassName = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
        return `css-Navigation-Item-${isActive ? 'Active' : 'Non-Active'}`;
    };
    const [currentLink, setCurrentLink] = React.useState<string>(active);
    const [showDescription, setShowDescription] = React.useState<boolean>(false);
    const [navigationStyle, setNavigationStyle] = React.useState({});

    return (
        <div
            style={{
                height: `100%`
            }}
        >
            <div
                style={{
                    width: `100%`,
                    height: `3rem`,
                    borderRadius: `unset`,
                    backgroundColor: Colors.main,
                    display: `flex`,
                    alignItems: `center`,
                    justifyContent: `center`
                }}
            >
                <IconButton
                    style={{
                        height: '30px',
                        width: '30px',
                        color: 'white'
                    }}
                    icon={wallet}
                />
            </div>
            <nav aria-label="Left side" id="leftNav" className="css-Navigation">
                <div id={'logos'}>
                    <NavigationItemList show={'logo'} active={active} onNavigation={onNavigation} />
                </div>
                <div id={'description'} style={navigationStyle}>
                    <NavigationItemList show={'description'} active={active} onNavigation={onNavigation} />
                </div>
            </nav>
            {!showDescription ? (
                <div
                    style={{
                        width: `100%`,
                        height: `3rem`,
                        borderRadius: `unset`,
                        backgroundColor: Colors.main,
                        display: `flex`,
                        alignItems: `center`,
                        justifyContent: `center`
                    }}
                >
                    <IconButton
                        icon={angleRight}
                        svgProps={{
                            height: `16px`,
                            width: `16px`
                        }}
                        onClick={(event) => {
                            setShowDescription(!showDescription);
                            setNavigationStyle(
                                showDescription
                                    ? { width: '0rem' }
                                    : {
                                          width: '10rem',
                                          borderLeft: `1px solid rgb(232, 232, 232)`
                                      }
                            );
                            if (onPanelChange) {
                                onPanelChange({ collapsed: !showDescription });
                            }
                        }}
                    />
                </div>
            ) : (
                <Button
                    aria-label="Side navigation expand/collapse"
                    className="css-Navigation-Collapse-Button"
                    onClick={(event) => {
                        setShowDescription(!showDescription);
                        setNavigationStyle(showDescription ? { width: '0rem' } : { width: '10rem' });
                        if (onPanelChange) {
                            onPanelChange({ collapsed: !showDescription });
                        }
                    }}
                    style={{
                        background: Colors.main
                    }}
                >
                    <span>Collapse</span>
                </Button>
            )}
        </div>
    );
};

export default Navigation;
