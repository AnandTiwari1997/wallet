import './text-box.css';

const TextBox = ({ value, ...props }: { value: any; [key: string]: any }) => {
    return (
        <input
            className="input"
            {...props}
            onChange={(event) => {
                value(event.target.value);
            }}
        />
    );
};

export default TextBox;
