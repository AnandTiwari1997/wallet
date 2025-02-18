import './progress-bar.css';
import { ComponentPropsWithoutRef } from 'react';

type IndeterminateCircularProgressProp = ComponentPropsWithoutRef<'div'>;

const IndeterminateCircularProgress = ({ ...props }: IndeterminateCircularProgressProp) => {
    return (
        <span {...props} className={'circular-progress-bar-container'}>
            <span className={'circular-indeterminate'}>
                <svg viewBox="0 0 40 40">
                    <circle className="svg-circle-indeterminate" cx="20" cy="20" r="15" fill="none" strokeWidth="3" />
                </svg>
            </span>
        </span>
    );
};

export default IndeterminateCircularProgress;
