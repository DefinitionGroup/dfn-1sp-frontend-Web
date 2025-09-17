import showtimeGallery from "./1SP/Components/showtimeGallery";

import badgeModule from "./1SP/Items/badgeModule";
import carouselItem from "./1SP/Items/carouselItem";
import slideUpText from "./1SP/Items/slideUpText";
import cardItem from "./1SP/Items/cardItem";
import member from "./1SP/Items/member";

import carousel from "./1SP/Objects/carousel";
import slideUpContent from "./1SP/Objects/slideUpContent";
import galleryStep from "./1SP/Objects/galleryStep";
import cards from "./1SP/Objects/cards";

import galleryCardsStep from "./1SP/Objects/GalleryScroll/galleryCardsStep";
import galleryHeroStep from "./1SP/Objects/GalleryScroll/galleryHeroStep";
import galleryListStep from "./1SP/Objects/GalleryScroll/galleryListStep";
import galleryPeopleStep from "./1SP/Objects/GalleryScroll/galleryPeopleStep";
import galleryScrollHighlightStep from "./1SP/Objects/GalleryScroll/galleryScrollHighlightStep";
import grid from "./1SP/Items/grid";

const oneSPComponents = [
    showtimeGallery
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
    carousel,
    slideUpContent,
    galleryStep,
    cards

];

const galleryScrollObjects = [
    galleryCardsStep,
    galleryHeroStep,
    galleryListStep,
    galleryPeopleStep,
    galleryScrollHighlightStep
];

export const OneSPschemaTypes = [
    ...oneSPComponents,
    ...oneSPItems,
    ...oneSPObjects,
    ...galleryScrollObjects
]