import { CardAction, CardBody, CardHeader, ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';
import { ComponentPropsWithRef, PropsWithChildren, ReactElement, ReactNode } from 'react';

export type CardHeaderProps = {
    components?: {
        heading?: ReactNode;
        action?: ReactNode;
    };
    childProps?: {
        container?: ExcludedComponentPropsWithoutRef<'div', 'className'>;
        title?: ExcludedComponentPropsWithoutRef<'div', 'className'>;
        action?: ExcludedComponentPropsWithoutRef<'div', 'className'>;
    };
    childClasses?: {
        container?: string;
        title?: string;
        action?: string;
    };
} & PropsWithChildren &
    ComponentPropsWithRef<'div'>;
export type CardBodyProps = PropsWithChildren & ComponentPropsWithRef<'div'>;
export type CardActionProps = PropsWithChildren & ComponentPropsWithRef<'div'>;

export type CardProps = {
    // components?: {
    //     header?: ReactElement<CardHeaderProps, typeof CardHeader>;
    //     body?: ReactElement<CardBodyProps, typeof CardBody>;
    //     action?: ReactElement<CardActionProps, typeof CardAction>;
    // };
    children?: Iterable<
        | (ReactElement<CardHeaderProps, typeof CardHeader> & ReactElement<CardBodyProps, typeof CardBody>)
        | ReactElement<CardActionProps, typeof CardAction>
    >;
} & ComponentPropsWithRef<'div'>;
