export const showHoverCard = (card, mouseEvent) => {
   window.dispatchEvent(new CustomEvent('show-hover-card', { detail: { card, mouseEvent } }));
};

export const hideHoverCard = () => {
   window.dispatchEvent(new CustomEvent('hide-hover-card'));
};

export const showHoverDeck = (deck, domElement) => {
   window.dispatchEvent(new CustomEvent('show-hover-deck', { detail: { deck, domElement } }));
};

export const hideHoverDeck = () => {
   window.dispatchEvent(new CustomEvent('hide-hover-deck'));
};
