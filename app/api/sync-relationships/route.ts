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

function generateKey(): string {
    return Math.random().toString(36).substring(2, 15)
}

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
        } else if (documentType === 'client') {
            synced = await syncClientRelationships(document)
        } else if (documentType === 'person') {
            synced = await syncPersonRelationships(document)
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
                    .append('services', [{ _ref: serviceId, _type: 'reference', _key: generateKey() }])
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
                    .append('services', [{ _ref: serviceId, _type: 'reference', _key: generateKey() }])
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
                    .append('servicegrouprel', [{ _ref: serviceGroupId, _type: 'reference', _key: generateKey() }])
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
                    .append('unitsrel', [{ _ref: unitId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncCaseStudyRelationships(caseStudy: any): Promise<number> {
    let synced = 0
    const caseStudyId = caseStudy._id
    const serviceRefs = caseStudy.services || []
    const unitRefs = caseStudy.units || []
    const clientRef = caseStudy.client
    const peopleRefs = caseStudy.people || []

    // Sync with services
    for (const serviceRef of serviceRefs) {
        const service = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: serviceRef._ref }
        )

        if (service) {
            const currentCaseStudies = service.caseStudies || []
            const hasCaseStudy = currentCaseStudies.some((ref: any) => ref._ref === caseStudyId)

            if (!hasCaseStudy) {
                await writeClient
                    .patch(service._id)
                    .setIfMissing({ caseStudies: [] })
                    .append('caseStudies', [{ _ref: caseStudyId, _type: 'reference', _key: generateKey() }])
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
            const currentCaseStudies = unit.caseStudies || []
            const hasCaseStudy = currentCaseStudies.some((ref: any) => ref._ref === caseStudyId)

            if (!hasCaseStudy) {
                await writeClient
                    .patch(unit._id)
                    .setIfMissing({ caseStudies: [] })
                    .append('caseStudies', [{ _ref: caseStudyId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    // Sync with client
    if (clientRef && clientRef._ref) {
        const client = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: clientRef._ref }
        )

        if (client) {
            const currentCaseStudies = client.caseStudies || []
            const hasCaseStudy = currentCaseStudies.some((ref: any) => ref._ref === caseStudyId)

            if (!hasCaseStudy) {
                await writeClient
                    .patch(client._id)
                    .setIfMissing({ caseStudies: [] })
                    .append('caseStudies', [{ _ref: caseStudyId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    // Sync with people
    for (const personRefObj of peopleRefs) {
        const personId = personRefObj.person?._ref
        if (!personId) continue

        const person = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: personId }
        )

        if (person) {
            const currentClients = person.client || []
            const hasClient = currentClients.some((ref: any) => ref._ref === clientRef?._ref)

            // Only sync if the case study has a client and person doesn't have that client yet
            if (clientRef?._ref && !hasClient) {
                await writeClient
                    .patch(person._id)
                    .setIfMissing({ client: [] })
                    .append('client', [{ _ref: clientRef._ref, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncClientRelationships(client: any): Promise<number> {
    let synced = 0
    const clientId = client._id
    const caseStudyRefs = client.caseStudies || []
    const peopleRefs = client.people || []

    // Sync with case studies
    for (const caseStudyRef of caseStudyRefs) {
        const caseStudy = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: caseStudyRef._ref }
        )

        if (caseStudy) {
            const currentClient = caseStudy.client

            // Only update if there's no client set or it's different
            if (!currentClient || currentClient._ref !== clientId) {
                await writeClient
                    .patch(caseStudy._id)
                    .set({ client: { _ref: clientId, _type: 'reference' } })
                    .commit()
                synced++
            }
        }
    }

    // Sync with people (now personReference objects)
    for (const personRefObj of peopleRefs) {
        const personId = personRefObj.person?._ref
        if (!personId) continue

        const person = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: personId }
        )

        if (person) {
            const currentClients = person.client || []
            const hasClient = currentClients.some((ref: any) => ref._ref === clientId)

            if (!hasClient) {
                await writeClient
                    .patch(person._id)
                    .setIfMissing({ client: [] })
                    .append('client', [{ _ref: clientId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}

async function syncPersonRelationships(person: any): Promise<number> {
    let synced = 0
    const personId = person._id
    const clientRefs = person.client || []

    // Sync with clients
    for (const clientRef of clientRefs) {
        const client = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: clientRef._ref }
        )

        if (client) {
            const currentPeople = client.people || []
            // Check if person already exists in the personReference objects
            const hasPerson = currentPeople.some((refObj: any) => refObj.person?._ref === personId)

            if (!hasPerson) {
                await writeClient
                    .patch(client._id)
                    .setIfMissing({ people: [] })
                    .append('people', [{
                        _type: 'personReference',
                        _key: generateKey(),
                        person: { _ref: personId, _type: 'reference' },
                        isPrimary: false
                    }])
                    .commit()
                synced++
            }
        }
    }

    return synced
}