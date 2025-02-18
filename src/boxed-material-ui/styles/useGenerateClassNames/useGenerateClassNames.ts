interface BoxedMaterialUiComponents {
    backdrop: 'backdrop';
    badge: 'badge';
    button: 'button';
    'calender-picker': 'calender-picker';
    card: 'card';
    menu: 'menu';
    overlay: 'overlay';
    popover: 'popover';
    input: 'input';
    icon: 'icon';
    'icon-button': 'icon-button';
    select: 'select';
    label: 'label';
}

const useGenerateClassNames = (
    componentName: keyof BoxedMaterialUiComponents,
    tags: (string | undefined)[]
): string[] => {
    const baseName = 'boxed-material-ui';
    if (tags && tags.length === 0) {
        return [`${baseName}-${componentName}`];
    }
    return tags
        .filter((value) => value !== undefined && value)
        .map((value) => {
            return `${baseName}-${componentName}-${value}`;
        });
};

export default useGenerateClassNames;
