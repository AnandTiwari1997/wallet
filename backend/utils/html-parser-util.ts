import * as htmlparser2 from 'htmlparser2';

export const htmlParserUtil = (mailString: string, onText: (text: string) => string | undefined) => {
    let mailText = '';
    let skipText = false;
    let texts: Map<string, string> = new Map<string, string>();
    let parser = new htmlparser2.Parser({
        onopentag(name: string, attribs: { [p: string]: string }, isImplied: boolean) {
            if (name === 'style') skipText = true;
        },
        ontext(text) {
            if (!skipText && text.trim().length > 0) {
                const returnedText = onText(text);
                if (returnedText) texts.set(returnedText, returnedText);
            }
        },
        onclosetag(name: string, isImplied: boolean) {
            if (name === 'style') skipText = false;
        }
    });
    parser.write(mailString);
    parser.end();
    for (let value of texts.values()) {
        mailText = mailText + ' ' + value;
    }
    return mailText;
};
