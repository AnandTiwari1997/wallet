import * as htmlparser2 from 'htmlparser2';

/**
 * Parses an HTML string to extract and process text content.
 *
 * @param mailString The HTML string to parse.
 * @param onText A callback function to process each extracted text node.
 * @returns A space-separated string of the processed text content.
 */
export const htmlParserUtil = (mailString: string, onText: (text: string) => string | undefined) => {
    // A set of HTML tags whose content should be skipped.
    const tagsToSkip = new Set(['style', 'script']);
    // A flag to indicate whether the parser is currently inside a tag to be skipped.
    let isSkipping = false;
    // A set to store the processed text content, ensuring uniqueness.
    const texts = new Set<string>();

    // Create a new htmlparser2 parser.
    let parser = new htmlparser2.Parser({
        /**
         * Called when an opening tag is encountered.
         * @param name The name of the tag.
         */
        onopentag(name: string) {
            if (tagsToSkip.has(name)) isSkipping = true;
        },
        /**
         * Called when a text node is encountered.
         * @param text The text content.
         */
        ontext(text) {
            const trimmedText = text.trim();
            // Process the text if not inside a skipped tag and the text is not empty.
            if (!isSkipping && trimmedText.length > 0) {
                const processedText = onText(trimmedText);
                if (processedText) texts.add(processedText);
            }
        },
        /**
         * Called when a closing tag is encountered.
         * @param name The name of the tag.
         */
        onclosetag(name: string) {
            if (tagsToSkip.has(name)) isSkipping = false;
        }
    });

    // Write the HTML string to the parser and end the parsing process.
    parser.write(mailString);
    parser.end();

    // Join the unique, processed text contents with a space and return the result.
    return Array.from(texts).join(' ');
};
