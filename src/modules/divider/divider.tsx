import React from 'react';

type DivProp = {
    width: number;
} & React.ComponentPropsWithoutRef<'div'>;

const Divider: React.FC<DivProp> = ({ width, ...props }: DivProp) => {
    return (
        <div
            style={{
                height: `${width / 2}px`,
                background: `var(--content-faded)`
            }}
            {...props}
        ></div>
    );
};

export default Divider;
