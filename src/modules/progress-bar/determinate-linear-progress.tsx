import './progress-bar.css';
import { ComponentPropsWithoutRef } from 'react';

type DeterminateLinearProgressProp = {
    value: number;
    valueBuffer?: number;
} & ComponentPropsWithoutRef<'div'>;

const DeterminateLinearProgress = ({ value, valueBuffer, ...props }: DeterminateLinearProgressProp) => {
    return (
        <>
            <span className={'progress-bar-container'} {...props}>
                <div
                    style={{
                        position: 'relative',
                        height: '100%',
                        width: '100%'
                    }}
                >
                    {valueBuffer && (
                        <>
                            <span className={'progress-bar-buffer-pattern'}></span>
                            <span
                                className={'progress-bar-determinate progress-bar-buffer'}
                                style={{
                                    width: `${valueBuffer}%`
                                }}
                            ></span>
                        </>
                    )}
                    <span
                        className={'progress-bar-determinate'}
                        style={{
                            width: `${value}%`
                        }}
                    ></span>
                </div>
            </span>
        </>
    );
};

export default DeterminateLinearProgress;
