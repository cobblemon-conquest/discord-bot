export class InvalidLinkingCode extends Error {

    constructor(linkingCode: string) {
        super(`Linking code ${linkingCode} is invalid or has expired.`);
        this.name = 'InvalidLinkingCode';
    }
}