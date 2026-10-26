import type { ReactNode } from 'react'
import Capabilities from './Capabilities'
import Hero from './Hero'
import Specimen from './Specimen'
import WorkSection from './WorkSection'
import { capabilities, heroContent, specimenContent, workContent } from '@studioco2/lib/content'
import type { CapabilitiesBlock, CasesStackBlock, HeroBlock, SpecimenBlock, Studioco2Block, UnknownBlock } from '@studioco2/lib/types'

type Block = Studioco2Block | UnknownBlock

/** Renders a page’s Studio CO2 blocks in order. Unknown block types render nothing. */
export default function Studioco2PageBuilder({ blocks, projectNote }: { blocks: Block[]; projectNote?: string }) {
  const sections: ReactNode[] = []
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]
    switch (block._type) {
      case 'studioco2Hero':
        sections.push(<Hero key={block._key} content={heroContent(block as HeroBlock)} />)
        break
      case 'studioco2Specimen': {
        // Capabilities directly after the statement share its section, as in P5.
        const following = blocks[index + 1]
        const paired = following?._type === 'studioco2Capabilities' ? capabilities(following as CapabilitiesBlock) : null
        if (paired) index++
        sections.push(<Specimen key={block._key} content={specimenContent(block as SpecimenBlock)}>{paired && paired.length > 0 && <Capabilities items={paired} />}</Specimen>)
        break
      }
      case 'studioco2Capabilities': {
        const items = capabilities(block as CapabilitiesBlock)
        if (items.length) sections.push(<section key={block._key} className="studio section-pad"><Capabilities items={items} /></section>)
        break
      }
      case 'studioco2CasesStack':
        sections.push(<WorkSection key={block._key} content={{ ...workContent(block as CasesStackBlock), projectNote }} />)
        break
      default:
        if (process.env.NODE_ENV === 'development') console.warn(`Studio CO2 page builder: no renderer for "${block._type}".`)
    }
  }
  return <>{sections}</>
}

/** The skip link targets the first case stack, else the main content. */
export function skipTarget(blocks: Block[]) {
  const stack = blocks.find((block): block is CasesStackBlock => block._type === 'studioco2CasesStack')
  return stack ? { href: `#${workContent(stack).anchor}`, label: 'Skip to work' } : { href: '#main', label: 'Skip to content' }
}
