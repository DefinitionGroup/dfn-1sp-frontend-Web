import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

// Create a client with write permissions for API routes
const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function POST(request: NextRequest) {
    try {
        const { documentId, documentType } = await request.json()

        if (!documentId || !documentType) {
            return NextResponse.json(
                { error: 'Document ID and type are required' },
                { status: 400 }
            )
        }

        // Get the document
        const document = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: documentId }
        )

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            )
        }

        let synced = 0

        if (documentType === 'services') {
            synced = await syncServiceRelationships(document)
        } else if (documentType === 'serviceGroup') {
            synced = await syncServiceGroupRelationships(document)
        } else if (documentType === 'unit') {
            synced = await syncUnitRelationships(document)
        } else if (documentType === 'caseStudy') {
            synced = await syncCaseStudyRelationships(document)
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${synced} relationships`,
            documentId,
            documentType
        })

    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json(
            { error: 'Failed to sync relationships' },
            { status: 500 }
        )
    }
}

async function syncServiceRelationships(service: any): Promise<number> {
    let synced = 0
    const serviceId = service._id
    const serviceGroupRefs = service.servicegrouprel || []
    const unitRefs = service.unitsrel || []

    // Sync with service groups
    for (const groupRef of serviceGroupRefs) {
        const serviceGroup = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: groupRef._ref }
        )

        if (serviceGroup) {
            const currentServices = serviceGroup.services || []
            const hasService = currentServices.some((ref: any) => ref._ref === serviceId)

            if (!hasService) {
                await writeClient
                    .patch(serviceGroup._id)
                    .setIfMissing({ services: [] })
                    .append('services', [{ _ref: serviceId, _type: 'reference' }])
                    .commit()
                synced++
            }
        }
    }

    // Sync with units
    for (const unitRef of unitRefs) {
        const unit = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: unitRef._ref }
        )

        if (unit) {
            const currentServices = unit.services || []
            const hasService = currentServices.some((ref: any) => ref._ref === serviceId)

            if (!hasService) {
                await writeClient
                    .patch(unit._id)
                    .setIfMissing({ services: [] })
                    .append('services', [{ _ref: serviceId, _type: 'reference' }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncServiceGroupRelationships(serviceGroup: any): Promise<number> {
    let synced = 0
    const serviceGroupId = serviceGroup._id
    const serviceRefs = serviceGroup.services || []

    // Sync with services
    for (const serviceRef of serviceRefs) {
        const service = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: serviceRef._ref }
        )

        if (service) {
            const currentServiceGroups = service.servicegrouprel || []
            const hasServiceGroup = currentServiceGroups.some((ref: any) => ref._ref === serviceGroupId)

            if (!hasServiceGroup) {
                await writeClient
                    .patch(service._id)
                    .setIfMissing({ servicegrouprel: [] })
                    .append('servicegrouprel', [{ _ref: serviceGroupId, _type: 'reference' }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncUnitRelationships(unit: any): Promise<number> {
    let synced = 0
    const unitId = unit._id
    const serviceRefs = unit.services || []

    // Sync with services
    for (const serviceRef of serviceRefs) {
        const service = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: serviceRef._ref }
        )

        if (service) {
            const currentUnits = service.unitsrel || []
            const hasUnit = currentUnits.some((ref: any) => ref._ref === unitId)

            if (!hasUnit) {
                await writeClient
                    .patch(service._id)
                    .setIfMissing({ unitsrel: [] })
                    .append('unitsrel', [{ _ref: unitId, _type: 'reference' }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncCaseStudyRelationships(caseStudy: any): Promise<number> {
    // Case studies have one-way relationships to services
    // No bidirectional sync needed
    return 0
}