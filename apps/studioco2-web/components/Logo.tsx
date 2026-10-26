type Props = { tone?: 'white' | 'theme'; decorative?: boolean }

/** Official artwork; the theme variant inverts only the monochrome ink. */
export default function Logo({ tone = 'theme', decorative = false }: Props) {
  return <img className={`studio-logo studio-logo--${tone}`} src={`/media/studioco2-logo-${tone === 'white' ? 'white' : 'black'}.svg`} width="496" height="393" alt={decorative ? '' : 'StudioCO2'} draggable={false} />
}
