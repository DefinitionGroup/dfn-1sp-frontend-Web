import showtimeGallery from "./1SP/Components/showtimeGallery";
import heroShowtime from "./1SP/Components/heroShowtime";
import sublineComponent from "./1SP/Components/sublineComponent";
import Header from "./1SP/Components/Header";
import contentSection from "./1SP/Components/contentSection";
import twoColContentSection from "./1SP/Components/twoColContentSection";
import tabbedContentSection from "./1SP/Components/tabbedContentSection";
import casesIntro from "./1SP/Components/casesIntro";
import casesGalleryFiltered from "./1SP/Components/casesGalleryFiltered";
import casesGalleryFilteredWithPagination from "./1SP/Components/casesGalleryFilteredWithPagination";
import servicesGalleryFiltered from "./1SP/Components/servicesGalleryFiltered";
import servicesHeroWithBadge from "./1SP/Components/servicesHeroWithBadge";
import intertitleCTA from "./1SP/Components/intertitleCTA";

import badgeModule from "./1SP/Items/badgeModule";
import carouselItem from "./1SP/Items/carouselItem";
import slideUpText from "./1SP/Items/slideUpText";
import cardItem from "./1SP/Items/cardItem";
import member from "./1SP/Items/member";

import carousel from "./1SP/Components/carousel";
import smartCarousel from "./1SP/Components/smartCarousel";
import smartServicesCarousel from "./1SP/Components/smartServicesCarousel";
import smartPeople from "./1SP/Components/smartPeople";
import smartUnitsGallery from "./1SP/Components/smartUnitsGallery";
import smartUnitsGlobe from "./1SP/Components/smartUnitsGlobe";
import globeComponent from "./1SP/Components/globeComponent";
import unitLogoGrid from "./1SP/Components/unitLogoGrid";
import pageBuilderLogoFloat from "./1SP/Components/pageBuilderLogoFloat";
import clientLogoCarousel from "./1SP/Components/clientLogoCarousel";
import pageBuilderPersonioJobs from "./1SP/Components/pageBuilderPersonioJobs";
import heroAdditionalContent from "./1SP/Objects/heroAdditionalContent";
import slideUpContent from "./1SP/Objects/slideUpContent";
import galleryStep from "./1SP/Objects/galleryStep";
import cards from "./1SP/Objects/cards";
import unitCards from "./1SP/Objects/unitCards";
import CtaMiniComponent from "./1SP/Objects/CtaMiniComponent";
import listItem from "./1SP/Objects/listItem";
import listStepHeader from "./1SP/Objects/listStepHeader";
import staggeredHeader from "./1SP/Objects/staggeredHeader";
import cardsStepContent from "./1SP/Objects/cardsStepContent";
import peopleStepHeader from "./1SP/Objects/peopleStepHeader";

import galleryCardsStep from "./1SP/Components/galleryCardsStep";
import galleryHeroStep from "./1SP/Components/galleryHeroStep";
import galleryListStep from "./1SP/Components/galleryListStep";
import galleryPeopleStep from "./1SP/Components/galleryPeopleStep";
import galleryScrollHighlightStep from "./1SP/Components/galleryScrollHighlightStep";
import grid from "./1SP/Items/grid";
import GalleryRevealStep from "./1SP/Components/GalleryRevealStep";
import GalleryOverviewStep from "./1SP/Components/GalleryOverviewStep";
import CTASplitHeader from "./1SP/Objects/CTASplitHeader";

const oneSPComponents = [
    showtimeGallery,
    heroShowtime,
    sublineComponent,
    Header,
    contentSection,
    twoColContentSection,
    tabbedContentSection,
    casesIntro,
    casesGalleryFiltered,
    casesGalleryFilteredWithPagination,
    servicesGalleryFiltered,
    servicesHeroWithBadge,
    intertitleCTA,
    // Individual gallery steps now available as standalone components
    galleryHeroStep,
    galleryCardsStep,
    galleryListStep,
    galleryPeopleStep,
    galleryScrollHighlightStep,
    GalleryRevealStep,
    GalleryOverviewStep,
    // Carousel and smart components as standalone
    carousel,
    smartCarousel,
    smartServicesCarousel,
    smartPeople,
    smartUnitsGallery,
    smartUnitsGlobe,
    globeComponent,
    unitLogoGrid,
    pageBuilderLogoFloat,
    clientLogoCarousel,
    pageBuilderPersonioJobs
];
const oneSPItems = [
    badgeModule,
    carouselItem,
    slideUpText,
    cardItem,
    member,
    grid
];
const oneSPObjects = [
    heroAdditionalContent,
    slideUpContent,
    galleryStep,
    cards,
    unitCards,
    CtaMiniComponent,
    CTASplitHeader,
    listItem,
    listStepHeader,
    staggeredHeader,
    cardsStepContent,
    peopleStepHeader
];

const galleryScrollObjects = [
    // Gallery scroll objects now moved to oneSPComponents for standalone use
];

export const OneSPschemaTypes = [
    ...oneSPComponents,
    ...oneSPItems,
    ...oneSPObjects,
    // galleryScrollObjects removed to prevent duplication
]
