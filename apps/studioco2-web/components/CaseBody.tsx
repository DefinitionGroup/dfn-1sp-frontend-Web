import { Fragment } from 'react'
import type { ResultMetric } from '@1sp/sanity-types'
import { metricPresentation } from '@1sp/utils/result-metrics'
import CaseMedia from './CaseMedia'
import { assetUrl, clean, cloudinary, imageUrl, videoPoster } from '@studioco2/lib/media'
import type { CaseBodyBlock, CloudinaryAsset } from '@studioco2/lib/types'

// Studio CO2 renderers for the shared case body blocks its cases use.

type TextBlock = { _type?: string; _key?: string; style?: string; listItem?: string; children?: { text?: string }[] }

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const strings = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : []

function SectionHead({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return <div className="case-section-head">
    {label && <span className="case-label">{label}</span>}
    {title && <h2>{title}{subtitle && <span className="case-subtitle"> {subtitle}</span>}</h2>}
  </div>
}

/** Minimal Portable Text: paragraphs and bullet lists of plain text. */
function RichText({ blocks }: { blocks: TextBlock[] }) {
  const groups: { list: boolean; items: TextBlock[] }[] = []
  for (const block of blocks.filter(item => item._type === 'block')) {
    const list = Boolean(block.listItem)
    const last = groups.at(-1)
    if (last && last.list && list) last.items.push(block)
    else groups.push({ list, items: [block] })
  }
  const line = (block: TextBlock) => (block.children ?? []).map(child => child.text ?? '').join('').trim()
  return <>{groups.map((group, index) => group.list
    ? <ul key={index} className="case-list">{group.items.map(item => <li key={item._key}>{line(item)}</li>)}</ul>
    : <Fragment key={index}>{group.items.map(item => line(item) && <p key={item._key}>{line(item)}</p>)}</Fragment>)}</>
}

function ChallengeAndSolution({ block }: { block: CaseBodyBlock }) {
  const items = block.showContent === false ? [] : strings(block.challenges)
  const solution = (block.showSolution ? block.solution : null) as TextBlock[] | null
  const listTitle = text(block.challengeTitle) || text(block.ctaHeading)
  const listIntro = text(block.ctaParagraph) || text(block.challengeDescription)
  return <section className="case-section section-pad">
    <SectionHead label={text(block.badgeText)} title={text(block.title)} />
    <div className="case-columns">
      <div className="case-lead">{text(block.description) && <p>{text(block.description)}</p>}</div>
      <div className="case-detail">
        {items.length > 0 && <>
          {listTitle && <h3>{listTitle}</h3>}
          {listIntro && <p>{listIntro}</p>}
          {items.length === 1 ? <p>{items[0]}</p> : <ul className="case-list">{items.map(item => <li key={item}>{item}</li>)}</ul>}
        </>}
        {solution && solution.length > 0 && <>
          {text(block.solutionHeadline) && <h3>{text(block.solutionHeadline)}</h3>}
          <RichText blocks={solution} />
        </>}
      </div>
    </div>
  </section>
}

function ApproachSection({ block }: { block: CaseBodyBlock }) {
  const details = strings(block.approachDetails)
  const video = clean(block.mediaType) === 'video' ? assetUrl(block.backgroundVideo as CloudinaryAsset) : undefined
  const image = imageUrl(assetUrl(block.backgroundImage as CloudinaryAsset), 2000)
  const title = text(block.mainHeadline)
  return <section className="case-section section-pad">
    <SectionHead label={text(block.badgeText)} title={title} subtitle={text(block.subHeadline)} />
    {(video || image) && <figure className="case-figure"><CaseMedia video={cloudinary(video, 'q_auto')} image={image ?? videoPoster(video)} alt={title} className="case-figure-media" /></figure>}
    <div className="case-columns">
      <div className="case-lead">{text(block.description) && <p>{text(block.description)}</p>}</div>
      {details.length > 0 && <ul className="case-detail case-list">{details.map(item => <li key={item}>{item}</li>)}</ul>}
    </div>
  </section>
}

function ResultsMetrics({ block }: { block: CaseBodyBlock }) {
  const metrics = (Array.isArray(block.metrics) ? block.metrics : []) as (ResultMetric & { _key?: string; label?: string; description?: string })[]
  return <section className="case-section section-pad">
    <SectionHead label={text(block.badgeText)} title={text(block.title)} />
    {text(block.description) && <p className="case-results-intro">{text(block.description)}</p>}
    {metrics.length > 0 && <dl className="case-metrics">{metrics.map((metric, index) => {
      // Diagram metrics are percentages; only animated numbers carry their own formatting.
      const display = metricPresentation(clean(metric.type) === 'animatedNumber' ? metric : { ...metric, suffix: '%' }).final
      return <div key={metric._key ?? index} className="case-metric"><dt>{metric.label}</dt><dd>{display}</dd>{metric.description && <p>{metric.description}</p>}</div>
    })}</dl>}
  </section>
}

export default function CaseBody({ blocks }: { blocks: CaseBodyBlock[] }) {
  return <>{blocks.map(block => {
    switch (block._type) {
      case 'challengeAndSolution': return <ChallengeAndSolution key={block._key} block={block} />
      case 'approachSection': return <ApproachSection key={block._key} block={block} />
      case 'resultsMetrics': return <ResultsMetrics key={block._key} block={block} />
      default: return null
    }
  })}</>
}
