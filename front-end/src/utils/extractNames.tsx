export const extractFileName = (info: string) => {
    const fileNameMatch = info.match(/'([^']+)'/);
    if (fileNameMatch && fileNameMatch[1]) {
        return fileNameMatch[1]; // Extracted file name with extension
    }
    return "null";
};