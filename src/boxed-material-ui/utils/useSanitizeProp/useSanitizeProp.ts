function sanitizeProps(props: any | undefined, defaultValue: any) {
    if (!props) {
        return defaultValue;
    }
    Object.keys(defaultValue).forEach((key) => {
        if (!props[key]) {
            props[key] = defaultValue[key];
        }
    });
    return props;
}

export default sanitizeProps;
