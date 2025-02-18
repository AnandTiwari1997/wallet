import './progress-bar.css';
import { ComponentPropsWithoutRef } from 'react';

type IndeterminateLinearProgressProp = ComponentPropsWithoutRef<'div'>;

const IndeterminateLinearProgress = ({ ...props }: IndeterminateLinearProgressProp) => {
    return (
        <span {...props} className={'progress-bar-container'}>
            <span className={'indeterminate'}></span>
        </span>
    );
};

export default IndeterminateLinearProgress;
