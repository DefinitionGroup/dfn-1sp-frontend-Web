type Locale = 'en' | 'de';

interface Translations {
    // Navigation IDs
    ids: {
        top: string;
        intro: string;
        content: string;
        approach: string;
        results: string;
        services: string;
        cases: string;
    };
    // Case Study Page
    caseStudy: {
        theChallenge: string;
        challenge: string;
        challengeDescription: string;
        services: string;
        servicesDescription: string;
        solution: string;
        approach: string;
        approachSubtitle: string;
        approachDescription: string;
        results: string;
        resultsSubtitle: string;
        resultsDescription: string;
        showTime: string;
        showTimeDescription: string;
        ctaText: string;
        ctaDescription: string;
        ctaButton: string;
        poweredBy: string;
        wantToKnowMore: string;
        contactPrefix: string;
        linkedInProfile: string;
    };
    // Cases List Page
    casesList: {
        title: string;
        subtitle: string;
        filterAll: string;
    };
    // Services Page
    services: {
        mission: string;
        missionSubtitle: string;
        title: string;
        subtitle: string;
        ctaHeading: string;
        ctaDescription: string;
        ctaButton: string;
        listItem1: string;
        listItem2: string;
        listItem3: string;
        servicesTitle: string;
        servicesSubtitle: string;
        excellence: string;
        excellenceSubtitle: string;
        excellenceDescription: string;
        filterAll: string;
        resultsTitle: string;
        resultsSubtitle: string;
        casesTitle: string;
        casesDescription: string;
    };
    // Badge module
    badges: {
        intro: string;
        theGoal: string;
        approach: string;
        whatWeAchieved: string;
        results: string;
        mission: string;
        whatWeDo: string;
    };
}

const translations: Record<Locale, Translations> = {
    en: {
        ids: {
            top: 'Top',
            intro: 'Intro',
            content: 'Content',
            approach: 'Approach',
            results: 'Results',
            services: 'Services',
            cases: 'Cases',
        },
        caseStudy: {
            theChallenge: 'The Challenge',
            challenge: 'Challenge:',
            challengeDescription: 'The Starting Point. A thorough analysis and understanding highlighted several key issues:',
            services: 'Services:',
            servicesDescription: 'This case study covers',
            solution: 'Solution',
            approach: 'Approach',
            approachSubtitle: 'What we achieved',
            approachDescription: 'Building awareness, expanding consideration, and ultimately driving more sales.',
            results: 'Results',
            resultsSubtitle: 'What we achieved',
            resultsDescription: 'Building awareness, expanding consideration, and ultimately driving more sales.',
            showTime: 'Show Time',
            showTimeDescription: 'Turn & Burn around Ideas, Deadlines, Campaigns.',
            ctaText: 'Touch the hearts and minds of audiences.',
            ctaDescription: 'Use the newest tools. Bring in your ideas. Work with top tier clients.',
            ctaButton: 'Join us for a ride',
            poweredBy: 'Powered by',
            wantToKnowMore: 'Want to know more?',
            contactPrefix: 'Contact',
            linkedInProfile: 'LinkedIn Profile',
        },
        casesList: {
            title: 'At 1SP, our passionate team thrives on creativity.',
            subtitle: 'Here is the proof. We deliver exceptional digital products and experiences that make a difference.',
            filterAll: 'All',
        },
        services: {
            mission: 'Mission',
            missionSubtitle: 'What we do',
            title: 'We tell your story.',
            subtitle: 'One shared passion: Creating epic experiences that captivate.',
            ctaHeading: 'We use Gaming Experience',
            ctaDescription: 'This is where we get our creative spark from. And epochs of customer focus and talking to the public.',
            ctaButton: 'Our Story',
            listItem1: 'For Consumer Electronics, Gaming & Technology',
            listItem2: 'We\'re a Superagency of like-minded and complimentary agencies all across Europe. The \'fit\' matters… that one shared passion for the same things. It\'s what makes us so unique.',
            listItem3: 'The loyal partnerships we have earned from our clients comes from our positive approach and amazing collection of experts across the group. With such a strong background in the Consumer Electronics, Gaming & Technology industries, we also bring gamification to everything we do.',
            servicesTitle: 'Services',
            servicesSubtitle: 'What we do',
            excellence: 'Excellence:',
            excellenceSubtitle: 'in thinking, creativity, and execution.',
            excellenceDescription: 'To drive brand awareness, make meaningful connections, and increase sales for our clients.',
            filterAll: 'All',
            resultsTitle: 'Results',
            resultsSubtitle: 'Cases',
            casesTitle: 'Our work speaks volumes.',
            casesDescription: 'Discover our latest projects in gaming, marketing, and interactive experiences',
        },
        badges: {
            intro: 'Intro',
            theGoal: 'The Goal',
            approach: 'Approach',
            whatWeAchieved: 'What we achieved',
            results: 'Results',
            mission: 'Mission',
            whatWeDo: 'What we do',
        },
    },
    de: {
        ids: {
            top: 'Oben',
            intro: 'Einführung',
            content: 'Inhalt',
            approach: 'Ansatz',
            results: 'Ergebnisse',
            services: 'Dienstleistungen',
            cases: 'Fälle',
        },
        caseStudy: {
            theChallenge: 'Die Herausforderung',
            challenge: 'Herausforderung:',
            challengeDescription: 'Der Ausgangspunkt. Eine gründliche Analyse und Verständnis hob mehrere Schlüsselthemen hervor:',
            services: 'Dienstleistungen:',
            servicesDescription: 'Diese Fallstudie umfasst',
            solution: 'Lösung',
            approach: 'Ansatz',
            approachSubtitle: 'Was wir erreicht haben',
            approachDescription: 'Bewusstsein schaffen, Überlegungen erweitern und letztendlich mehr Verkäufe erzielen.',
            results: 'Ergebnisse',
            resultsSubtitle: 'Was wir erreicht haben',
            resultsDescription: 'Bewusstsein schaffen, Überlegungen erweitern und letztendlich mehr Verkäufe erzielen.',
            showTime: 'Showtime',
            showTimeDescription: 'Ideen, Deadlines und Kampagnen schnell umsetzen.',
            ctaText: 'Berühren Sie Herzen und Köpfe des Publikums.',
            ctaDescription: 'Nutzen Sie die neuesten Tools. Bringen Sie Ihre Ideen ein. Arbeiten Sie mit erstklassigen Kunden.',
            ctaButton: 'Begleiten Sie uns',
            poweredBy: 'Powered by',
            wantToKnowMore: 'Mehr erfahren?',
            contactPrefix: 'Kontakt',
            linkedInProfile: 'LinkedIn Profil',
        },
        casesList: {
            title: 'Bei 1SP lebt unser leidenschaftliches Team von Kreativität.',
            subtitle: 'Hier ist der Beweis. Wir liefern außergewöhnliche digitale Produkte und Erlebnisse, die einen Unterschied machen.',
            filterAll: 'Alle',
        },
        services: {
            mission: 'Mission',
            missionSubtitle: 'Was wir tun',
            title: 'Wir erzählen Ihre Geschichte.',
            subtitle: 'Eine gemeinsame Leidenschaft: Epische Erlebnisse schaffen, die fesseln.',
            ctaHeading: 'Wir nutzen Gaming-Erfahrung',
            ctaDescription: 'Hier bekommen wir unseren kreativen Funken. Und Epochen des Kundenfokus und des Gesprächs mit der Öffentlichkeit.',
            ctaButton: 'Unsere Geschichte',
            listItem1: 'Für Unterhaltungselektronik, Gaming & Technologie',
            listItem2: 'Wir sind eine Superagentur von gleichgesinnten und sich ergänzenden Agenturen in ganz Europa. Die \'Passung\' ist wichtig... diese eine gemeinsame Leidenschaft für dieselben Dinge. Das macht uns so einzigartig.',
            listItem3: 'Die loyalen Partnerschaften, die wir von unseren Kunden verdient haben, kommen von unserem positiven Ansatz und der erstaunlichen Sammlung von Experten in der Gruppe. Mit einem so starken Hintergrund in der Unterhaltungselektronik-, Gaming- und Technologiebranche bringen wir auch Gamification in alles ein, was wir tun.',
            servicesTitle: 'Dienstleistungen',
            servicesSubtitle: 'Was wir tun',
            excellence: 'Exzellenz:',
            excellenceSubtitle: 'im Denken, in der Kreativität und in der Ausführung.',
            excellenceDescription: 'Um Markenbekanntheit zu steigern, bedeutungsvolle Verbindungen zu schaffen und den Umsatz für unsere Kunden zu steigern.',
            filterAll: 'Alle',
            resultsTitle: 'Ergebnisse',
            resultsSubtitle: 'Fälle',
            casesTitle: 'Unsere Arbeit spricht Bände.',
            casesDescription: 'Entdecken Sie unsere neuesten Projekte in Gaming, Marketing und interaktiven Erlebnissen',
        },
        badges: {
            intro: 'Einführung',
            theGoal: 'Das Ziel',
            approach: 'Ansatz',
            whatWeAchieved: 'Was wir erreicht haben',
            results: 'Ergebnisse',
            mission: 'Mission',
            whatWeDo: 'Was wir tun',
        },
    },
};

/**
 * Get translations for a specific locale
 * @param locale - The locale to get translations for (en or de)
 * @returns Translations object for the specified locale
 */
export function getTranslations(locale: string): Translations {
    const normalizedLocale = locale.toLowerCase().startsWith('de') ? 'de' : 'en';
    return translations[normalizedLocale];
}

/**
 * Helper function to get a specific translation
 * @param locale - The locale to use
 * @param key - Dot-notation path to the translation (e.g., 'caseStudy.theChallenge')
 * @returns The translated string
 */
export function t(locale: string, key: string): string {
    const trans = getTranslations(locale);
    const keys = key.split('.');
    let value: any = trans;

    for (const k of keys) {
        value = value?.[k];
    }

    return value || key;
}
