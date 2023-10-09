import './text-box.css';

const TextBox = ({ value, setValue, ...props }: { value: any; [key: string]: any }) => {
    return (
        <input
            className="input"
            value={value}
            {...props}
            onChange={(event) => {
                setValue(event.target.value);
            }}
        />
    );
};

export default TextBox;
