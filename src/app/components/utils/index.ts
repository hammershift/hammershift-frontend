export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replaceAll(' ', '_');
}