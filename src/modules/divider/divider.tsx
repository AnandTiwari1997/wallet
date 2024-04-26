import React from 'react';

type DivProp = {
    width: number;
} & React.ComponentPropsWithoutRef<'div'>;

const Divider: React.FC<DivProp> = ({ width, ...props }: DivProp) => {
    return (
        <div
            style={{
                borderTop: `${width / 2}px solid black`,
                borderBottom: `${width / 2}px solid black`
            }}
            {...props}
        ></div>
    );
};

export default Divider;
