export interface SaveMediaInterface { 
    destinationPromise: Promise<unknown>,
    destinationStream: NodeJS.WritableStream,
}

export interface MediaHandler {
    deleteMedia: (filePath: string) =>  Promise<unknown>,
    saveMedia: (filePath: string, mimeType: string) => SaveMediaInterface
} 