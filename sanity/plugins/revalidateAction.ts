import { DocumentActionComponent } from 'sanity'
import { getRevalidationBaseUrl } from '@/lib/site-url'

export const revalidateAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props

    return {
        label: 'Revalidate Cache',
        icon: () => '🔄',
        onHandle: async () => {
            const doc = draft || published

            if (!doc) {
                return
            }

            try {
                const baseUrl = getRevalidationBaseUrl()

                const response = await fetch(`${baseUrl}/api/revalidate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _type: type,
                        _id: id,
                        slug: doc.slug,
                        language: doc.language,
                        channel: doc.channel,
                    }),
                })

                const data = await response.json()

                if (data.success) {
                    // Show success message
                    props.onComplete()
                } else {
                    throw new Error(data.message || 'Revalidation failed')
                }
            } catch (error) {
                console.error('Revalidation error:', error)
            }
        },
    }
}
