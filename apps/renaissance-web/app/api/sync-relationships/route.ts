import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@1sp/sanity-queries/env'
import { getChannelFromEnv } from '@1sp/site-config'
import { hasValidBearerToken } from '@1sp/utils/server/request-security'

export const runtime = 'nodejs'

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
        if (process.env.RELATIONSHIP_SYNC_ENABLED !== 'true') {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const syncSecret = process.env.SANITY_SYNC_SECRET
        if (!syncSecret) {
            console.error('SANITY_SYNC_SECRET is not configured')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 503 }
            )
        }

        if (!hasValidBearerToken(request.headers.get('authorization'), syncSecret)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if write token is configured
        if (!process.env.SANITY_API_WRITE_TOKEN) {
            console.error('SANITY_API_WRITE_TOKEN is not configured')
            return NextResponse.json(
                { error: 'Server configuration error: Write token not configured' },
                { status: 500 }
            )
        }

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

        if (document._type !== documentType) {
            return NextResponse.json(
                { error: 'Document type does not match the stored document' },
                { status: 409 }
            )
        }

        const activeChannel = getChannelFromEnv()
        const documentChannels = Array.isArray(document.channel)
            ? document.channel
            : document.channel
                ? [document.channel]
                : []

        if (documentChannels.length > 0 && !documentChannels.includes(activeChannel)) {
            return NextResponse.json(
                { error: 'Document is outside this deployment channel' },
                { status: 403 }
            )
        }

        let synced = 0

        try {
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
            } else {
                return NextResponse.json(
                    { error: `Unsupported document type: ${documentType}` },
                    { status: 400 }
                )
            }
        } catch (syncError) {
            console.error(`Error in sync${documentType}Relationships:`, syncError)
            throw syncError // Re-throw to be caught by outer catch
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${synced} relationships`,
            documentId,
            documentType
        })

    } catch (error) {
        console.error('Sync error details:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            {
                error: 'Failed to sync relationships',
                details: errorMessage,
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        )
    }
}

async function syncServiceRelationships(service: any): Promise<number> {
    let synced = 0
    const serviceId = service._id
    const serviceGroupRefs = service.servicegrouprel || []
    const unitRefs = service.unitsrel || []
    const caseStudyRefs = service.caseStudies || []

    const serviceGroupIds = serviceGroupRefs.map((ref: any) => ref._ref)
    const unitIds = unitRefs.map((ref: any) => ref._ref)
    const caseStudyIds = caseStudyRefs.map((ref: any) => ref._ref)

    // 1. Sync with service groups (Add missing)
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

    // 2. Remove stale service group relationships
    // Find all service groups that reference this service but are NOT in the current list
    const staleServiceGroups = await writeClient.fetch(
        `*[_type == "serviceGroup" && references($serviceId) && !(_id in $currentGroupIds)]`,
        { serviceId, currentGroupIds: serviceGroupIds }
    )

    for (const group of staleServiceGroups) {
        const updatedServices = (group.services || []).filter((ref: any) => ref._ref !== serviceId)
        await writeClient
            .patch(group._id)
            .set({ services: updatedServices })
            .commit()
        synced++
    }


    // 3. Sync with units (Add missing)
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

    // 4. Remove stale unit relationships
    const staleUnits = await writeClient.fetch(
        `*[_type == "unit" && references($serviceId) && !(_id in $currentUnitIds)]`,
        { serviceId, currentUnitIds: unitIds }
    )

    for (const unit of staleUnits) {
        const updatedServices = (unit.services || []).filter((ref: any) => ref._ref !== serviceId)
        await writeClient
            .patch(unit._id)
            .set({ services: updatedServices })
            .commit()
        synced++
    }

    // 5. Sync with case studies (Add missing)
    for (const caseStudyRef of caseStudyRefs) {
        const caseStudy = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: caseStudyRef._ref }
        )

        if (caseStudy) {
            const currentServices = caseStudy.services || []
            const hasService = currentServices.some((ref: any) => ref._ref === serviceId)

            if (!hasService) {
                await writeClient
                    .patch(caseStudy._id)
                    .setIfMissing({ services: [] })
                    .append('services', [{ _ref: serviceId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    // 6. Remove stale case study relationships
    const staleCaseStudies = await writeClient.fetch(
        `*[_type == "caseStudy" && references($serviceId) && !(_id in $currentCaseStudyIds)]`,
        { serviceId, currentCaseStudyIds: caseStudyIds }
    )

    for (const caseStudy of staleCaseStudies) {
        const updatedServices = (caseStudy.services || []).filter((ref: any) => ref._ref !== serviceId)
        await writeClient
            .patch(caseStudy._id)
            .set({ services: updatedServices })
            .commit()
        synced++
    }

    return synced
}

async function syncServiceGroupRelationships(serviceGroup: any): Promise<number> {
    let synced = 0
    const serviceGroupId = serviceGroup._id
    const serviceRefs = serviceGroup.services || []
    const serviceIds = serviceRefs.map((ref: any) => ref._ref)

    // 1. Sync with services (Add missing)
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

    // 2. Remove stale service relationships
    const staleServices = await writeClient.fetch(
        `*[_type == "services" && references($serviceGroupId) && !(_id in $currentServiceIds)]`,
        { serviceGroupId, currentServiceIds: serviceIds }
    )

    for (const service of staleServices) {
        const updatedGroups = (service.servicegrouprel || []).filter((ref: any) => ref._ref !== serviceGroupId)
        await writeClient
            .patch(service._id)
            .set({ servicegrouprel: updatedGroups })
            .commit()
        synced++
    }

    return synced
}

async function syncUnitRelationships(unit: any): Promise<number> {
    let synced = 0
    const unitId = unit._id
    const serviceRefs = unit.services || []
    const caseStudyRefs = unit.caseStudies || []

    const serviceIds = serviceRefs.map((ref: any) => ref._ref)
    const caseStudyIds = caseStudyRefs.map((ref: any) => ref._ref)

    // 1. Sync with services (Add missing)
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

    // 2. Remove stale service relationships
    const staleServices = await writeClient.fetch(
        `*[_type == "services" && references($unitId) && !(_id in $currentServiceIds)]`,
        { unitId, currentServiceIds: serviceIds }
    )

    for (const service of staleServices) {
        const updatedUnits = (service.unitsrel || []).filter((ref: any) => ref._ref !== unitId)
        await writeClient
            .patch(service._id)
            .set({ unitsrel: updatedUnits })
            .commit()
        synced++
    }

    // 3. Sync with case studies (Add missing)
    for (const caseStudyRef of caseStudyRefs) {
        const caseStudy = await writeClient.fetch(
            `*[_id == $id][0]`,
            { id: caseStudyRef._ref }
        )

        if (caseStudy) {
            const currentUnits = caseStudy.units || []
            const hasUnit = currentUnits.some((ref: any) => ref._ref === unitId)

            if (!hasUnit) {
                await writeClient
                    .patch(caseStudy._id)
                    .setIfMissing({ units: [] })
                    .append('units', [{ _ref: unitId, _type: 'reference', _key: generateKey() }])
                    .commit()
                synced++
            }
        }
    }

    // 4. Remove stale case study relationships
    const staleCaseStudies = await writeClient.fetch(
        `*[_type == "caseStudy" && references($unitId) && !(_id in $currentCaseStudyIds)]`,
        { unitId, currentCaseStudyIds: caseStudyIds }
    )

    for (const caseStudy of staleCaseStudies) {
        const updatedUnits = (caseStudy.units || []).filter((ref: any) => ref._ref !== unitId)
        await writeClient
            .patch(caseStudy._id)
            .set({ units: updatedUnits })
            .commit()
        synced++
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

    const serviceIds = serviceRefs.map((ref: any) => ref._ref)
    const unitIds = unitRefs.map((ref: any) => ref._ref)
    const clientId = clientRef?._ref
    const peopleIds = peopleRefs.map((ref: any) => ref.person?._ref || ref._ref).filter(Boolean)

    console.log(`Syncing case study ${caseStudyId}: ${serviceRefs.length} services, ${unitRefs.length} units, client: ${!!clientRef}, ${peopleRefs.length} people`)

    // 1. Sync with services (Add missing)
    for (const serviceRef of serviceRefs) {
        try {
            if (!serviceRef?._ref) {
                console.warn('Invalid service reference:', serviceRef)
                continue
            }

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
                    console.log(`Synced case study to service ${service._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing service ${serviceRef._ref}:`, error)
        }
    }

    // 2. Remove stale service relationships
    const staleServices = await writeClient.fetch(
        `*[_type == "services" && references($caseStudyId) && !(_id in $currentServiceIds)]`,
        { caseStudyId, currentServiceIds: serviceIds }
    )

    for (const service of staleServices) {
        const updatedCaseStudies = (service.caseStudies || []).filter((ref: any) => ref._ref !== caseStudyId)
        await writeClient
            .patch(service._id)
            .set({ caseStudies: updatedCaseStudies })
            .commit()
        synced++
    }


    // 3. Sync with units (Add missing)
    for (const unitRef of unitRefs) {
        try {
            if (!unitRef?._ref) {
                console.warn('Invalid unit reference:', unitRef)
                continue
            }

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
                    console.log(`Synced case study to unit ${unit._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing unit ${unitRef._ref}:`, error)
        }
    }

    // 4. Remove stale unit relationships
    const staleUnits = await writeClient.fetch(
        `*[_type == "unit" && references($caseStudyId) && !(_id in $currentUnitIds)]`,
        { caseStudyId, currentUnitIds: unitIds }
    )

    for (const unit of staleUnits) {
        const updatedCaseStudies = (unit.caseStudies || []).filter((ref: any) => ref._ref !== caseStudyId)
        await writeClient
            .patch(unit._id)
            .set({ caseStudies: updatedCaseStudies })
            .commit()
        synced++
    }


    // 5. Sync with client (Add/Update)
    if (clientRef && clientRef._ref) {
        try {
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
                    console.log(`Synced case study to client ${client._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing client ${clientRef._ref}:`, error)
        }
    }

    // 6. Remove stale client relationships
    // Find clients that reference this case study but are NOT the current client
    const staleClients = await writeClient.fetch(
        `*[_type == "client" && references($caseStudyId) && _id != $currentClientId]`,
        { caseStudyId, currentClientId: clientId || "NO_CLIENT" }
    )

    for (const client of staleClients) {
        const updatedCaseStudies = (client.caseStudies || []).filter((ref: any) => ref._ref !== caseStudyId)
        await writeClient
            .patch(client._id)
            .set({ caseStudies: updatedCaseStudies })
            .commit()
        synced++
    }


    // 7. Sync with people (Add missing)
    for (const personRefObj of peopleRefs) {
        try {
            // Handle both old structure (direct reference) and new structure (personReference object)
            const personId = personRefObj.person?._ref || personRefObj._ref
            if (!personId) {
                console.warn('Invalid person reference:', personRefObj)
                continue
            }

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
                    console.log(`Synced client to person ${person._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing person:`, error)
        }
    }

    // Note: We generally don't remove client links from people automatically via case study sync
    // because a person might be linked to a client for other reasons.
    // So we skip removal logic for Person -> Client via Case Study.

    return synced
}

async function syncClientRelationships(client: any): Promise<number> {
    let synced = 0
    const clientId = client._id
    const caseStudyRefs = client.caseStudies || []
    const peopleRefs = client.people || []

    const caseStudyIds = caseStudyRefs.map((ref: any) => ref._ref)
    const peopleIds = peopleRefs.map((ref: any) => ref.person?._ref || ref._ref).filter(Boolean)

    console.log(`Syncing client ${clientId}: ${caseStudyRefs.length} case studies, ${peopleRefs.length} people`)

    // 1. Sync with case studies (Add/Update)
    for (const caseStudyRef of caseStudyRefs) {
        try {
            if (!caseStudyRef?._ref) {
                console.warn('Invalid case study reference:', caseStudyRef)
                continue
            }

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
                    console.log(`Synced client to case study ${caseStudy._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing case study ${caseStudyRef._ref}:`, error)
        }
    }

    // 2. Remove stale case study relationships
    // Find case studies that reference this client but are NOT in the current list
    // Note: Case Study -> Client is a singular reference, so we might just want to unset it?
    // Or if the case study thinks it belongs to this client, but the client doesn't list it...
    // It's safer to only unset if the case study currently points to THIS client.
    const staleCaseStudies = await writeClient.fetch(
        `*[_type == "caseStudy" && client._ref == $clientId && !(_id in $currentCaseStudyIds)]`,
        { clientId, currentCaseStudyIds: caseStudyIds }
    )

    for (const caseStudy of staleCaseStudies) {
        await writeClient
            .patch(caseStudy._id)
            .unset(['client'])
            .commit()
        synced++
    }


    // 3. Sync with people (Add missing)
    for (const personRefObj of peopleRefs) {
        try {
            // Handle both old structure (direct reference) and new structure (personReference object)
            const personId = personRefObj.person?._ref || personRefObj._ref
            if (!personId) {
                console.warn('Invalid person reference:', personRefObj)
                continue
            }

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
                    console.log(`Synced client to person ${person._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing person:`, error)
        }
    }

    // 4. Remove stale person relationships
    const stalePeople = await writeClient.fetch(
        `*[_type == "person" && references($clientId) && !(_id in $currentPeopleIds)]`,
        { clientId, currentPeopleIds: peopleIds }
    )

    for (const person of stalePeople) {
        const updatedClients = (person.client || []).filter((ref: any) => ref._ref !== clientId)
        await writeClient
            .patch(person._id)
            .set({ client: updatedClients })
            .commit()
        synced++
    }

    return synced
}

async function syncPersonRelationships(person: any): Promise<number> {
    let synced = 0
    const personId = person._id
    const clientRefs = person.client || []
    const clientIds = clientRefs.map((ref: any) => ref._ref)

    console.log(`Syncing person ${personId}: ${clientRefs.length} clients`)

    // 1. Sync with clients (Add missing)
    for (const clientRef of clientRefs) {
        try {
            if (!clientRef?._ref) {
                console.warn('Invalid client reference:', clientRef)
                continue
            }

            const client = await writeClient.fetch(
                `*[_id == $id][0]`,
                { id: clientRef._ref }
            )

            if (client) {
                const currentPeople = client.people || []
                // Check if person already exists in the personReference objects
                const hasPerson = currentPeople.some((refObj: any) => {
                    // Handle both old structure (direct reference) and new structure (personReference object)
                    return refObj.person?._ref === personId || refObj._ref === personId
                })

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
                    console.log(`Synced person to client ${client._id}`)
                }
            }
        } catch (error) {
            console.error(`Error syncing client ${clientRef._ref}:`, error)
        }
    }

    // 2. Remove stale client relationships
    // Find clients that reference this person but are NOT in the current list
    // Note: Client -> People is an array of objects.
    const staleClients = await writeClient.fetch(
        `*[_type == "client" && references($personId) && !(_id in $currentClientIds)]`,
        { personId, currentClientIds: clientIds }
    )

    for (const client of staleClients) {
        const updatedPeople = (client.people || []).filter((refObj: any) => {
            const refId = refObj.person?._ref || refObj._ref
            return refId !== personId
        })

        await writeClient
            .patch(client._id)
            .set({ people: updatedPeople })
            .commit()
        synced++
    }

    return synced
}
