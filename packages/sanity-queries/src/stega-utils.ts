import { vercelStegaDecode } from '@vercel/stega'

export function safeDecodeStega(text: string): string {
    if (!text || typeof text !== 'string') {
        return text
    }

    try {
        // Check if the string contains stega encoding characters
        if (!text.includes('\u2060') && !text.includes('\ufeff') && !text.includes('\u200b')) {
            return text
        }

        const decoded = vercelStegaDecode(text)
        if (typeof decoded === 'string') {
            return decoded
        }
        return cleanStegaString(text)
    } catch (error) {
        // Silently handle the error and return cleaned text
        return cleanStegaString(text)
    }
}

export function cleanStegaString(text: string): string {
    if (!text || typeof text !== 'string') {
        return text
    }

    // Remove all stega encoding characters
    return text.replace(/[\u2060\ufeff\u200b\u200c\u200d]/g, '')
}

export function isStegaEncoded(text: string): boolean {
    if (!text || typeof text !== 'string') {
        return false
    }

    return /[\u2060\ufeff\u200b\u200c\u200d]/.test(text)
}

// Recursively clean stega from objects
export function cleanStegaFromObject<T>(obj: T): T {
    if (typeof obj === 'string') {
        return cleanStegaString(obj) as T
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanStegaFromObject) as T
    }

    if (obj && typeof obj === 'object') {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
            cleaned[key] = cleanStegaFromObject(value)
        }
        return cleaned
    }

    return obj
}