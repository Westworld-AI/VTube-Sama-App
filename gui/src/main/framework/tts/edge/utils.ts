import fs from 'fs/promises'

export async function ensureDir(path: string) {
    try {
        await fs.access(path)
        console.log(`dir exists: ${path}`)
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            await fs.mkdir(path, { recursive: true })
            console.log(`create dir succed: ${path}`)
        } else {
            throw error
        }
    }
}

export function escapeSSML(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}