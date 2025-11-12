import { DocumentActionComponent, DocumentActionDescription } from 'sanity'

// Document action that calls the sync API endpoint
export const syncServiceGroupRelationships: DocumentActionComponent = (props) => {
    const { draft, published, type } = props

    // Apply to documents that have bidirectional relationships
    const supportedTypes = ['services', 'serviceGroup', 'unit', 'caseStudy', 'client', 'person']

    if (!supportedTypes.includes(type)) {
        return null
    }

    return {
        label: 'Save & Sync Relationships',
        icon: () => '🔄',
        onHandle: async () => {
            const doc = draft || published
            if (!doc) {
                return {
                    type: 'error',
                    message: 'No document found to sync.'
                }
            }

            try {
                // Call the API endpoint to sync relationships
                const response = await fetch('/api/sync-relationships', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        documentId: doc._id,
                        documentType: type
                    })
                })

                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to sync relationships')
                }

                return {
                    type: 'success',
                    message: result.message || 'Relationships synced successfully!'
                }

            } catch (error) {
                console.error('Error syncing relationships:', error)
                return {
                    type: 'error',
                    message: `Error syncing relationships: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            }
        }
    } as DocumentActionDescription
}