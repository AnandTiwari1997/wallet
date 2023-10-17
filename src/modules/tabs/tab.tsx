export interface TabProp {
    label: string;
    value: string;
    children: any;
    classes?: string;
}

const Tab = ({ label, value, children, classes }: TabProp) => {
    return <div className={'tab--content'}>{children}</div>;
};

export default Tab;
