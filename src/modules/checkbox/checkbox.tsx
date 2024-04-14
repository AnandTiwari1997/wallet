import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CSS from 'csstype';

// We use em because because we're matching Mui styling

const iconStyle: CSS.Properties = {
    width: '1em',
    height: '1em',
    padding: '0.125em',
    lineHeight: 'inherit',
    color: 'rgb(34, 52, 60)'
};

const uncheckedIcon = <FontAwesomeIcon icon={faSquare} style={iconStyle} className="icon" />;
const checkedIcon = <FontAwesomeIcon icon={faCheckSquare} style={iconStyle} className="icon" />;

/**
 * A wrapper for the material design `FormControlLabel` `Checkbox` control.
 * Sets our custom overrides and checks for a label to determine the implementation.
 **
 * See MD docs for full api - [FormControlLabel](https://material-ui.com/api/form-control-label/) | [Checkbox](https://material-ui.com/api/checkbox/)
 */
const Checkbox = ({
    ariaLabel,
    ariaLabelledby,
    indeterminate,
    label,
    customStyles,
    customLabelStyles,
    labelPlacement,
    ...baseProps
}: {
    [key: string]: any;
}): JSX.Element => {
    return label ? (
        <FormControlLabel
            control={
                <MuiCheckbox className={customStyles} {...baseProps} checkedIcon={checkedIcon} icon={uncheckedIcon} />
            }
            className={customLabelStyles}
            label={label}
            labelPlacement={labelPlacement!}
        />
    ) : (
        <MuiCheckbox
            {...baseProps}
            checkedIcon={checkedIcon}
            className={customStyles}
            icon={uncheckedIcon}
            inputProps={ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : { 'aria-label': ariaLabel }}
        />
    );
};

export default Checkbox;
