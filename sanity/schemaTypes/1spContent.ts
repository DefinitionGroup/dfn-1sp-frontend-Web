import showtimeGallery from "./1SP/Components/showtimeGallery";
import heroShowtime from "./1SP/Components/heroShowtime";
import sublineComponent from "./1SP/Components/sublineComponent";
import Header from "./1SP/Components/Header";
import contentSection from "./1SP/Components/contentSection";
import casesIntro from "./1SP/Components/casesIntro";
import casesGalleryFiltered from "./1SP/Components/casesGalleryFiltered";
import servicesGalleryFiltered from "./1SP/Components/servicesGalleryFiltered";
import servicesHeroWithBadge from "./1SP/Components/servicesHeroWithBadge";

import badgeModule from "./1SP/Items/badgeModule";
import carouselItem from "./1SP/Items/carouselItem";
import slideUpText from "./1SP/Items/slideUpText";
import cardItem from "./1SP/Items/cardItem";
import member from "./1SP/Items/member";

import carousel from "./1SP/Objects/carousel";
import smartCarousel from "./1SP/Objects/smartCarousel";
import smartPeople from "./1SP/Objects/smartPeople";
import heroAdditionalContent from "./1SP/Objects/heroAdditionalContent";
import slideUpContent from "./1SP/Objects/slideUpContent";
import galleryStep from "./1SP/Objects/galleryStep";
import cards from "./1SP/Objects/cards";
import CtaMiniComponent from "./1SP/Objects/CtaMiniComponent";
import listItem from "./1SP/Objects/listItem";
import listStepHeader from "./1SP/Objects/listStepHeader";
import staggeredHeader from "./1SP/Objects/staggeredHeader";
import cardsStepContent from "./1SP/Objects/cardsStepContent";
import peopleStepHeader from "./1SP/Objects/peopleStepHeader";

import galleryCardsStep from "./1SP/Objects/GalleryScroll/galleryCardsStep";
import galleryHeroStep from "./1SP/Objects/GalleryScroll/galleryHeroStep";
import galleryListStep from "./1SP/Objects/GalleryScroll/galleryListStep";
import galleryPeopleStep from "./1SP/Objects/GalleryScroll/galleryPeopleStep";
import galleryScrollHighlightStep from "./1SP/Objects/GalleryScroll/galleryScrollHighlightStep";
import grid from "./1SP/Items/grid";
import GalleryRevealStep from "./1SP/Objects/GalleryScroll/GalleryRevealStep";
import GalleryOverviewStep from "./1SP/Objects/GalleryScroll/GalleryOverviewStep";
import CTASplitHeader from "./1SP/Objects/CTASplitHeader";

const oneSPComponents = [
    showtimeGallery,
    heroShowtime,
    sublineComponent,
    Header,
    contentSection,
    casesIntro,
    casesGalleryFiltered,
    servicesGalleryFiltered,
    servicesHeroWithBadge,
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
    smartPeople
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
