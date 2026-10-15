import assert from 'node:assert/strict';
import type { ResultMetric } from '../packages/sanity-types/src';
import {copy} from './renaissance-content-model';

export type MetricDraft = ResultMetric & {sourceText: string};
export type ResultGroup = {title:string;context?:string;description?:string;metrics:MetricDraft[]};
// Only manually selected, source-checked claims pass through this migration helper.
// Runtime rendering consumes structured numbers and never parses editorial copy.
function m(sourceText:string,label:string,extra:Partial<ResultMetric>={}):MetricDraft {
  const match=sourceText.match(/(~|nearly |just under |under |over )?(\d[\d,]*(?:\.\d+)?)(\+)?\s*(?:(bn|million|billion|m|k)(?![a-z]))?(\+)?(%|\/10)?/i);
  assert(match,sourceText);
  const [,prefix,number,plus,unit,unitPlus,suffix]=match;
  const scale=unit?.toLowerCase();
  const displayScale=scale==='bn'||scale==='billion'?'billion':scale==='m'||scale==='million'?'million':scale==='k'?'thousand':'none';
  const multiplier={none:1,thousand:1e3,million:1e6,billion:1e9}[displayScale];
  const qualifier=plus||unitPlus?'plus':prefix==='~'?'approximately':prefix?.toLowerCase().includes('nearly')?'nearly':prefix?.toLowerCase().includes('under')?'lessThan':prefix?.toLowerCase().includes('over')?'moreThan':'exact';
  return {type:'animatedNumber',sourceText,label,value:Number(number.replaceAll(',',''))*multiplier,displayScale,decimalPlaces:number.split('.')[1]?.length||0,qualifier,animationMode:'countUp',...(suffix?{suffix}:{}),...extra};
}
const g=(title:string,context:string,metrics:MetricDraft[],description=''):ResultGroup=>({title,...(context?{context}:{}),metrics,...(description?{description}:{})});

export const resultGroups:Record<number,ResultGroup[]>={
41:[
 g('Media results','Within 7 days of the announcement',[m('238 articles','Articles'),m('545.6m UVPM','Reported UVPM'),m('50 from Tier 1 media','Tier 1 media articles')], 'Highlights: Terra Game On (32.3m), GameStar (11.1m), PC Gamer (10.8m), GamesRadar+ (10.5m) and 3D Juegos (7.3m).'),
 g('Creator results','Pre-announcement creator group',[m('3.3m organic views','Organic views'),m('67.7m subscriber base','Combined subscriber base')], 'A small, trusted creator group kept the reveal leak-free.'),
 g('Preview access','Ahead of Gamescom 2026',[m('21 confirmed media and creators','Confirmed media and creators')], 'An exclusive London preview ran across three two-hour sessions, including IGN, Eurogamer, Metro, GamesIndustry.biz, EDGE and Jackfrags.'),
],
44:[
 g('Media results','Within 7 days of launch',[m('397+ articles','Articles'),m('1.2bn UVPM','Reported UVPM'),m('150+ from Tier 1 outlets','Tier 1 outlet articles')], 'Highlights: IGN US (74.4m), Game8 US (31m), Terra Game On (32.3m), PlayGround (22.4m) and GameRant US (16.5m).'),
 g('Review results','Within 7 days of launch',[m('50 reviews','Reviews'),m('89.9','Average review score')]),
 g('Creator results','',[m('4,058,049 views','Views'),m('681 channels','Channels'),m('1,200+ pieces of content','Pieces of content')], 'The source breakdown reports 1.8m YouTube views and 2.1m Twitch VOD views, from a 36m combined subscriber base. Creators included Gameranx, CohhCarnage, knekro, GameLinked and DansGaming.'),
],
47:[
 g('Media results','',[m('428 articles','Articles'),m('1.1bn UVPM','Reported UVPM'),m('88 reviews','Reviews tracked')], 'Highlights: IGN (80m), GameSpot (33m), Metro (12.7m), The Gamer (10.8m) and Polygon (11.8m).'),
 g('Organic creator results','',[m('422+ pieces of content','Pieces of content'),m('1.3m+ views','Views',{context:'In the 7 days post-launch'})], 'Coverage spanned YouTube, Twitch and TikTok, from a 9.8m combined subscriber base.'),
],
50:[
 g('Media results','By launch',[m('700+ pieces of coverage','Pieces of coverage'),m('3.75bn UVPM','Reported UVPM')], 'New trailers, content reveals and an ARG campaign drove 12+ leadership interviews, including BBC Gaming (19.4m), Variety (29.5m), GamesIndustry.biz and Insider Gaming. Coverage was led by IGN, The Mirror, Game Rant and Vandal.'),
 g('Creator results','',[m('380m views','Views',{qualifier:'moreThan',context:'Within a week'}),m('17,000+ Twitch channels','Twitch channels'),m('1,500+ YouTube channels','YouTube channels')], 'Coverage also spanned 600+ social channels, from a combined subscriber base of nearly 1 billion. Sales exceeded expectations, concurrent players doubled versus Chapter 4, and the game reached #1 Global Top Seller on Steam and most-played on Twitch.'),
],
53:[
 g('Media results','7 days after launch',[m('329 articles','Articles'),m('1.76bn potential reach','Potential reach'),m('218 guides','Guides published',{description:'Still climbing daily at the reporting point.'})], 'Highlights: GameRant, PC Gamer, GamesRadar, The Gamer, Eurogamer and 3DJuegos.'),
 g('Creator results','',[m('1.1m+ views','Views'),m('395 channels','Channels'),m('2,600+ Twitch streams','Twitch streams tracked')], "The campaign drew on 21m+ combined subscribers, including a weeklong Kinda Funny sponsorship and a Yogscast 'Starsand Island Bingo' series their audience named a new favourite."),
],
56:[
 g('Media results','Within 7 days',[m('455+ articles','Articles'),m('1.6bn UVPM','Reported UVPM'),m('111+ Metacritic/OpenCritic reviews','Metacritic/OpenCritic reviews')], 'The campaign also secured 113 guides and 17 interviews. Coverage included the New York Times, The Guardian, MeriStation, IGN US and Screen Rant. Stand-out editorial: an exclusive EDGE cover feature, and a Suda51 Katsu Curry collaboration with Radio Times/BBC Good Food Kitchen that Rock Paper Shotgun followed up by recreating every in-game recipe—all inside a two-week UK/US promotional tour ahead of launch.'),
 g('Creator results','',[m('4,075,000+ views','Views'),m('401 channels','Channels')], 'The source breakdown reports 2.8m YouTube views and 1.2m Twitch VOD views, from a 47m subscriber base.'),
],
58:[
 g('Media results','7 days',[m('257 articles','Articles'),m('199 outlets','Outlets'),m('211.2m UVPM','Reported UVPM')], 'Highlights: TechRadar UK, GameReactor, 3DJuegos, Gamingbible and Everyeye.it.'),
 g('Trailer distribution','',[m('500,000+ combined views','Combined views')], "Distributed on IGN and PlayStation's official YouTube channel."),
],
60:[
 g('Media results','7 days',[m('328 articles','Articles'),m('240 outlets','Outlets'),m('577.9m UVPM','Reported UVPM')], 'Highlights: IGN US, ScreenRant, GameRant, TechRadar UK and Galaxus.'),
 g('Organic creator results','',[m('21m+ views','Views'),m('450+ channels','Channels')]),
],
62:[
 g('Media results','7 days post-launch',[m('1,200 articles','Articles'),m('2.1bn UVPM','Reported UVPM'),m('158 reviews','Reviews')], 'Highlights: IGN (105.5m), Forbes (78.3m), GameRant (47.4m), Sportskeeda, TechRadar, The Gamer, Vandal and Nintendo Life.'),
 g('Creator results','',[m('512 pieces of content','Pieces of content'),m('1.4m+ views','Views')], 'Across YouTube and Twitch, from a 61.6m subscriber base.'),
],
64:[
 g('Media results','',[m('327 articles','Articles'),m('1.3bn UVPM','Reported UVPM')], 'Highlights: IGN US, Game Rant, GameSpot US, Vandal and GamesRadar+.'),
 g('Organic creator results','',[m('5,400+ pieces of content','Pieces of content'),m('4.5m+ views','Views')], 'All organic, from a 65m subscriber base.'),
],
66:[
 g('Media results','7 days',[m('216 articles','Articles'),m('243.9m estimated potential views','Estimated potential views'),m('82 scored reviews','Scored reviews')], 'Highlights: IGN US, RedBull DE, Multiplayer.it, Everyeye.it and Top Gear.'),
 g('Creator results','',[m('200+ targeted creators','Targeted creators'),m('267+ streams/videos','Streams/videos'),m('730,000+ views','Views')], 'From a 9.3m subscriber base.'),
],
68:[
 g('Media results','',[m('1,675 pieces of ambassador coverage','Pieces of ambassador coverage'),m('34bn UVPM','Reported UVPM'),m('28,397 pieces of coverage worldwide mentioned Gamescom','Worldwide coverage pieces mentioning Gamescom')], 'Highlights: Tech Radar, GamesRadar+, PCGamesN, VGC and Jeux Video.'),
 g('Creator ambassador results','',[m('142 pieces','Content pieces'),m('215%','Year-on-year growth',{prefix:'+',description:'Growth in creator ambassador content pieces.'}),m('4.9m+ views','Views')], 'From an 11.7m subscriber base.'),
],
70:[g('Gamescom activation results','',[m('27 media appointments','Media appointments'),m('73 pieces of content','Pieces of content'),m('852,152,855 UVPM','Reported UVPM',{description:'From Tier 1 outlets.'})], "Tier 1 coverage included PCGamesN, Gaming Bible, WCCFTech, Gamespot and Game Informer. Delivered via a full B2B presence, custom key art and physical props produced with sister company Studio Co2. Several future exclusive opportunities were secured; reported UVPM exceeded the client's Sony State of Play reveal earlier the same year.")],
72:[g('Launch results','Within 7 days of launch',[m('745+ articles','Articles'),m('4.9bn+ potential reach','Potential reach'),m('450+ guides','Guides')], 'Guides included IGN, Polygon, Kotaku, Game8 and TheGamer. The campaign also secured 120+ reviews across the Americas. SGF preview coverage included GameSpot, Screen Rant, Game Rant, IGN Brazil and Terra.')],
74:[
 g('Campaign results','Since announcement',[m('3,257 articles','Articles'),m('40bn UVPM','Reported UVPM')], 'Highlights: IGN UK, Areajugones, Sapo TEK, TGcom24.it and PC Gamer UK. Supported by live events at The Game Awards, Summer GameFest, Gamescom, a bespoke Oslo studio hands-on, and a Dune: Part 2 screening in LA.'),
 g('Launch announcement results','Within 7 days',[m('389 articles','Articles'),m('4.3bn reach','Reported reach'),m('53 reviews','Reviews')]),
],
76:[
 g('Media results','7 days',[m('130 articles','Articles'),m('319m UVPM','Reported UVPM'),m('79 reviews','Reviews')], 'Highlights: IGN USA, GameRant, Gamespot, The Mirror, PC Gamer and Nintendo Life.'),
 g('Organic creator results','',[m('295 pieces of content','Pieces of content'),m('564,000+ views','Views')], 'Organic coverage, from an 8.2m subscriber base.'),
],
78:[
 g('Media results','First week',[m('248 articles','Articles'),m('687m UVPM','Reported UVPM'),m('53%','Coverage naming Antstream in the headline')], '56 Tier 1 outlets, including Forbes, IGN US, GameSpot US and GameRant US.'),
 g('Creator results','',[m('375,000+ views','Views'),m('50 targeted Retro/Xbox channels','Targeted Retro/Xbox channels')], 'From a 3m subscriber base.'),
],
80:[
 g('Media results','Within 7 days',[m('350 articles','Articles'),m('2.9bn potential reach','Potential reach'),m('167 from Tier 1 media','Tier 1 media articles')], 'Highlights: GameRant, TGcom24 and Metro.'),
 g('Creator results','',[m('1.2m views','Views')], 'From a 7.9m subscriber base.'),
],
82:[
 g('Media results','Within 7 days of launch',[m('775 articles','Articles'),m('3.6bn UVPM','Reported UVPM'),m('290 reviews','Reviews')], '630+ review codes were distributed. Highlights: MeriStation, IGN US, GameRant, Sportskeeda (28 articles alone) and Vandal. Backed by GDC meetings, a VIP London hands-on and Steam Next Fest codes.'),
 g('Creator results','',[m('200+ targeted creators','Targeted creators'),m('9.1m+ views','Views'),m('807,000 hours watched','Twitch hours watched')], 'From a 164m combined subscriber base. Coverage included 780+ Twitch streams and 237 YouTube videos (4.4m+ views).'),
],
84:[
 g('Media results','First week',[m('113 articles','Articles'),m('158.3m UVPM','Reported UVPM'),m('58 reviews','Reviews')], 'Highlights: IGN, Game8, Duniaki, Vice and CriticalHits.'),
 g('Organic creator results','',[m('688 pieces of content','Pieces of content'),m('2.1m+ views','Views')], 'Organic coverage, from an 11m subscriber base.'),
],
86:[
 g('Media results','Within 7 days of launch',[m('850 articles','Articles'),m('5.3bn potential reach','Potential reach'),m('135 reviews','Reviews')], '160 guides, backed by hands-on events at GDC, The Game Awards, gamescom and a UK VIP preview.'),
 g('Creator results','',[m('500+ targeted creators','Targeted creators'),m('4,000+ streams','Streams',{context:'Week one'}),m('6.4m organic views','Organic views',{context:'Full 12-month campaign'})], '375 YouTube videos in week one.'),
],
88:[
 g('Media results','Within 7 days',[m('105 articles','Articles'),m('195.8m UVPM','Reported UVPM'),m('72 news pieces','News pieces')], "Highlights: IGN US, PCGamesN, 3d Juegos, Areajugones and WCCFTech. Media consistently cited the game's combat, weapon handling, visuals and core gameplay loop as standout strengths for an Early Access title."),
 g('Creator results','',[m('1m views','Views')], 'From a 9.5m subscriber base.'),
],
90:[
 g('Media results','7 days',[m('1,195 articles','Articles'),m('14.3bn potential reach','Potential reach')], 'Highlights: IGN, ScreenRant, Sports Illustrated, Tgcom, GameRant and Gamespot. Coverage was strongly positive: Metacritic 80, a 9/10 from IGN with a GOTY nomination, and IGN hosting the guides on its homepage launch week.'),
 g('Launch milestone','First week',[m('10 million+ downloads','Downloads')]),
],
92:[
 g('Media results','Within 7 days',[m('3,117 articles','Articles'),m('27bn potential reach','Potential reach'),m('1,491 from Tier 1 media','Tier 1 media articles')], '179 global reviews, including IGN, Gamespot, GamesRadar+, TechRadar and Rock Paper Shotgun. Coverage drove the game to the No.1 PC store-discoverability spot globally. Events included 88 Tier 1 media/creators at SGF, 44 interviews and 55 hands-on sessions at gamescom, Prague/LA preview trips, and a sold-out BAFTA London documentary screening.'),
 g('Creator results','',[m('80m+ organic views','Organic views',{context:'Within 7 days'}),m('110,000+ Twitch streams','Twitch streams'),m('7,000+ channels','Channels across platforms')], '320+ targeted creators.'),
],
94:[
 g('Media results','First week',[m('197 articles','Articles'),m('698.4m UVPM','Reported UVPM'),m('64 reviews','Reviews')], 'Highlights: IGN US/UK, GameRant, iDNES.cz, Vandal and The Gamer.'),
 g('Creator results','',[m('227 pieces of content','Pieces of content'),m('1.1m+ views','Views')], 'From a 10.8m subscriber base.'),
],
96:[
 g('Media results','Crowdfunding announcement',[m('320 articles','Articles'),m('212 outlets','Outlets'),m('1.3bn UVPM','Reported UVPM')], 'Highlights: IGN, GameRant, Gamespot, GamesRadar+ and The Gamer.'),
 g('Creator results','Crowdfunding announcement',[m('25 pieces of content','Pieces of content'),m('162.5k+ views','Views')], 'From a 600k subscriber base—a strong result for a crowdfunding announcement specifically.'),
],
98:[
 g('Media results','Across Gamescom and ONL',[m('1,577 pieces of coverage','Pieces of coverage'),m('31.6bn UVPM','Reported UVPM')], 'Highlights: Gamerant, Tech Radar, TheGamer, GamesRadar+, Vandal and The Sun.'),
 g('Ambassador YouTube results','',[m('45 pieces','Content pieces'),m('3.83m+ views','Views')], 'From a 16m subscriber base.'),
],
100:[
 g('Gamescom reveal results','Under 3 weeks',[m('630+ articles','Articles'),m('2.54bn reach','Reported reach'),m('642,000 organic views','IGN YouTube exclusive views')], 'The reveal included Opening Night Live. Ahead of Summer Game Fest, a dedicated LA hands-on hosted 24 VIP Tier 1 outlets, with 80+ attendees at Playdays, including IGN, PC Gamer, VGC and The Gamer.'),
 g('Campaign results','Cumulative total to date',[m('nearly 1,500 articles','Articles'),m('over 8.5 billion combined reach','Combined reach')]),
],
102:[g('Announcement results','Announcement week',[m('362 articles','Articles'),m('1.1bn combined reach','Combined reach')], 'A strong result for a delayed-platform release. Highlights: Interia PL, IGN, ScreenRant, GameSpot, GameRant and TheGamer.')],
104:[
 g('Media results','Across the campaign',[m('582 articles','Articles'),m('4.5bn UVPM','Reported UVPM')], 'Highlights: IGN, The Mirror, GAMINGbible, TheGamer and PC Gamer.'),
 g('Creator results','',[m('435 YouTube videos','YouTube videos'),m('6,000+ Twitch streams','Twitch streams'),m('20 million VOD views','VOD views',{qualifier:'lessThan',context:'Just under this value through end of June'})], 'Outreach contacted 350+ creators and received 80+ responses. Notable creator wins: MixiGaming, Shroud, Kamikatze and VanossGaming.'),
],
106:[
 g('Media results','',[m('452 pieces of coverage','Pieces of coverage'),m('1.2bn combined UVPM','Combined UVPM'),m('79 reviews','Reviews',{description:'Average score approximately 7/10.'})], '68 Tier 1 articles. Biggest wins: Vandal, PC Gamer, PCGamesN and Nintendo Life.'),
 g('Creator results','',[m('152 channels','Channels creating content',{context:'Launch week alone'}),m('2.3m+ total views','Total views')], '190+ new targets researched, with organic wins on Twitch (WELOVEGAMES, mee_shell) and YouTube (Gameranx, Mortismal Gaming).'),
],
108:[g('Media results','Within 7 days of launch',[m('234m+ UVPM','Reported UVPM')], 'Across specialist and mainstream media, including GAMINGbible, BBC Radio Scotland, Mirror, PC Gamer and Eurogamer.')],
110:[
 g('Media results','',[m('54 articles','Articles'),m('86.6m UVPM','Reported UVPM')], 'Highlights: The Gamer UK/NA, Nintendo Life UK and VGC UK.'),
 g('Creator results','Last-minute outreach',[m('122.8k+ views','Views')], 'Across YouTube and Twitch.'),
],
112:[
 g('Media results','Within 7 days of launch',[m('140m+ UVPM','Reported UVPM'),m('38 reviews','Reviews')]),
 g('Creator results','',[m('579,112+ organic VOD views','Organic VOD views'),m('23,790','Peak live viewership'),m('27,490 hours watched','Twitch hours watched')], 'Across 121+ channels, including roguelike creators Splattercat Gaming, Beelz and Lirik.'),
],
114:[g('Media results','',[m('261 articles','Articles'),m('811m UVPM','Reported UVPM'),m('15 mostly positive reviews','Mostly positive reviews')], 'Coverage highlights: IGN US, PC Gamer UK and TechRadar UK. Reviews included PC Gamer UK, Polygon US and Rock Paper Shotgun UK.')],
116:[
 g('Media results','2-month window',[m('208 pieces of coverage','Pieces of coverage'),m('862m UVPM','Reported UVPM')], 'Biggest wins: Screen Rant, PCGamesN, Gamestar and Eurogamer.de.'),
 g('Creator results','',[m('600+ Twitch channels','Twitch channels'),m('250+ YouTube videos','YouTube videos'),m('5m+ total views','Total views')], '70+ curated creators plus 350+ additional targets, including Zerator, Arcade Bulls and What a Buy.'),
],
118:[
 g('Briefing event results','3-day briefing event',[m('351m UVPM','Reported UVPM')]),
 g('Reveal results','Around the TGA reveal',[m('313 articles','Articles'),m('1.8bn EU reach','EU reach')], "Secured the front cover of EDGE magazine's February 2024 issue as part of a 3-way activation spanning the press tour, the TGA reveal and an in-depth feature."),
],
120:[g('Media results','Pre-announcement digital briefings',[m('316 articles','Articles'),m('2.7bn reach','Reported reach')], 'Secured a front cover for the March 2024 issue of a leading gaming magazine, as part of a multi-pronged activation spanning the pre-briefing, the TGA reveal and an in-depth feature.')],
122:[
 g('Launch media results','',[m('6.9bn views','Reported views from earned media',{context:'Launch month'}),m('117 reviews','Reviews'),m('80+','Average review score')], '20 reviews were Metacritic-approved.'),
 g('Post-launch creator results','Post-launch',[m('500,000+ organic views','Organic views'),m('94 channels','Channels'),m('235 videos','Videos')], 'Targeted outreach to lore- and slice-of-life-focused creators kept content flowing well past launch week. Twitch streamer SimplyPressStart (20,200 followers) streamed the game 28 times after console release.'),
],
124:[g('Media results','Across Gamescom and ONL',[m('299 pieces of coverage','Pieces of coverage'),m('3.7bn UVPM','Reported UVPM')], 'Including a dedicated Geoff Keighley interview/digital conference. Coverage on Tech Radar, The Guardian, VGC, USA Today, The Radio Times, NME and IGN Brazil.')],
126:[g('Media results','',[m('270 articles','Articles'),m('~750m monthly reach','Monthly reach'),m('20+ Tier 1 media interviews','Tier 1 media interviews',{context:'Cologne'})], 'TheGamer\'s Meg Pelliccio: "This renaissance will reinvigorate the series & appeal to old fans and new players alike... for the new generation, like my young son, it\'s a whole new experience."')],
128:[g('Media and creator attendance','',[m('20+ leading media and content channels','Leading media and content channels attending'),m('200m+ UVPM reach','Combined UVPM reach')], 'Including The Gamer, Tech Radar, Eurogamer, PS Access and GGRecon.')],
130:[g('Creator results','',[m('just under 700,000 views','Paid talent views',{context:'At launch'}),m('3,000,000','Total campaign views',{qualifier:'moreThan',description:'Paid talent combined with organic outreach.'})], 'Twitch homepage front-page placements in key territories drove hundreds of thousands of views. Curated paid talent ran across Twitch, YouTube and TikTok.')],
132:[
 g('Media results','Since the event',[m('52 articles','Articles'),m('27.9m reach','Reported reach')], 'VGC coverage doubled year-on-year. The judging panel included Lucy James (Gamespot), Mike Channell (OBX), Jake Tucker (TechRadar) and Alexis Trust (Chucklefish), hosted by Aoife Wilson.'),
 g('Industry attendance','',[m('500+ professionals','Professionals'),m('180 studios','Studios'),m('45 publishers','Publishers')], 'Across 12 countries.'),
],
134:[
 g('Media results','Across 5 territories over 2 years',[m('1,400+ articles','Articles'),m('14.7bn UMV','Reported UMV')], 'Including Edge, Forbes, The Guardian and The Sun. Dedicated events at PAX, Gamescom, Venice Film Festival and BAFTA. 140 reviews at launch.'),
 g('Creator results','',[m('115 creators','Creators engaged'),m('406,000+ views','Views')], 'Across 63 Twitch and 53 YouTube channels, from a 4.9m subscriber base.'),
],
136:[g('Media results','',[m('120+ articles','Articles'),m('~620m monthly audience','Monthly audience')], 'Coverage across IGN\'s global network and a livestreamed Kinda Funny interview. RockPaperShotgun Editor-in-Chief Katharine Castle: "Move over Returnal... Luna Abyss is your next favourite bullet hell shooter."')],
138:[
 g('Media results','',[m('320 articles','Articles'),m('~1.1bn potential audience','Potential audience')], 'Including Radio Times, The Metro, IGN and The Gamer.'),
 g('Creator and event results','',[m('170+ creator channels','Creator channels covering the game organically'),m('40+ media and creators','Media and creators at the activation')], "A standout activation: media and creators played the game at Peaky Blinders: The Rise, the real London venue built from the show's actual TV sets."),
],
140:[
 g('Media results','To date',[m('3,094 articles','Articles'),m('10.5bn UVPM','Reported UVPM'),m('239 reviews','Reviews')]),
 g('Creator campaign growth','',[m('14.4m+ views','Views',{context:'At launch'}),m('18.9m+ total views','Total views',{context:'Campaign total'}),m('1,240 pieces of content','Pieces of content',{context:'Campaign total'})], '393 creators at launch, across 261 Twitch and 132 YouTube channels.'),
],
142:[
 g('Day-one reviews','Day one · UK/AU/IT',[m('31 reviews','Reviews'),m('176m UVPM','Reported UVPM')]),
 g('Overall media results','Overall',[m('275 pieces of coverage','Pieces of coverage'),m('1.6bn UVPM','Reported UVPM')], 'Standouts: PC Gamer, RockPaperShotgun, a Eurogamer Recommended award, Financial Times and Forbes.'),
 g('Creator results','',[m('29 curated creators','Curated creators'),m('36 pieces of content','Pieces of content'),m('500,000+ views','Views')], 'Including Skill-up and Mad Morph.'),
],
144:[
 g('Gamescom results','Concert and media programme',[m('200+ organic articles','Organic articles'),m('698m potential audience','Potential audience')]),
 g('Campaign results','Full campaign to date',[m('1,487 articles','Articles'),m('13.3bn UVPM','Reported UVPM'),m('206 reviews','Reviews')]),
],
146:[
 g('Media results','',[m('400 articles','Articles'),m('1.2bn monthly audience','Estimated monthly audience')], 'Including IGN, Forbes, TheGamer, Eurogamer and NME.'),
 g('Creator results','',[m('~200 channels','Channels'),m('1m+ views','Views')], 'From a ~6m subscriber base.'),
],
148:[
 g('Media results','Across the campaign',[m('1,100+ articles','Articles'),m('11.6bn combined UVPM reach','Combined UVPM reach')]),
 g('Organic creator results','',[m('763 engagements','Twitch and YouTube engagements'),m('25.7m total organic views','Total organic views')], 'Secured by the in-house creator team.'),
],
150:[
 g('Pre-launch media results','Ahead of launch',[m('2,400+ articles','Articles'),m('42 Tier 1 previews','Tier 1 previews')], 'One IGN developer-commentary exclusive. Backed by an Xbox showcase reveal, an IGN First exclusive and an Edge Magazine cover story.'),
 g('Launch-week media results','Launch week',[m('500+ articles','Articles'),m('4.1bn reach','Reported reach'),m('828.6m estimated reads','Estimated reads')], 'A 7.4% share of voice across 8,000+ monitored publications, with 90% of global Tier 1 outlets covering the game on day one.'),
 g('Creator results','',[m('1,000+ pieces of content','Pieces of content',{context:'Under two weeks'}),m('15m+ VOD views','VOD views'),m('57,700 hours broadcast','Hours broadcast')]),
],
152:[g('Review results','',[m('86','Metacritic score'),m('60+ UK reviews','UK reviews')], 'Ranked 14th highest PS4 game of 2019 and 9th on Xbox One (source: Metacritic). In October 2019, it was the 4th most-covered game worldwide and 3rd most-viewed on Twitch (source: fancensus.com).')],
154:[
 g('Media results','',[m('300+ articles','Articles'),m('50+ reviews','Reviews'),m('80','Metacritic score')], "Cover feature in Wireframe Magazine, a lead review in The Guardian's G2 supplement, plus Eurogamer, Polygon and Rock Paper Shotgun coverage."),
 g('Organic creator results','100% organic',[m('36,666,410 YouTube views','YouTube views'),m('203,605 hours watched','Twitch hours watched'),m('782 broadcasters','Twitch broadcasters')], '100+ YouTube creators.'),
],
158:[g('Editorial recognition','',[],copy(158))],
161:[g('Coverage and recognition','',[],copy(161))],
165:[g('Reveal and event results','',[m('73 Gamescom bookings','Gamescom bookings'),m('280+ pieces of coverage','Pieces of coverage',{context:'From the reveal'}),m('2 front covers','Front covers')], 'A worldwide exclusive with IGN, localised into 25 languages across 114 countries.')],
168:[g('Independent recognition','',[],copy(168))],
170:[g('Campaign contribution','',[],copy(170))],
};

export function validateResultSources() {
  for (const [row,groups] of Object.entries(resultGroups)) {
    const source=copy(Number(row));
    for (const group of groups) for (const metric of group.metrics) {
      assert(source.includes(metric.sourceText),`F${row}: missing source claim ${metric.sourceText}`);
      assert(Number.isFinite(metric.value),`F${row}: invalid value`);
    }
  }
}
