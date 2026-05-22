export async function putFileToSignedUrl(signedUrl: string, file: File): Promise<void> {
    const response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
    });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(
            body
                ? `Error al subir el archivo (${response.status}): ${body}`
                : `Error al subir el archivo (${response.status})`
        );
    }
}
