/* global Selectr */

/**
 * Initialising global variables
 */
const ACTIVE_CLASS = 'visible';
const sort = {
    ALPHABETICAL_ASCENDING: (a,b) => a.dataset.name > b.dataset.name ? 1 : -1,
    ALPHABETICAL_DESCENDING: (a,b) => a.dataset.name < b.dataset.name ? 1 : -1,
    DIFFICULTY_ASCENDING: (a,b) => a.dataset.difficulty > b.dataset.difficulty ? 1 : -1,
    DIFFICULTY_DESCENDING: (a,b) => a.dataset.difficulty < b.dataset.difficulty ? 1 : -1
};

const contentEl = document.getElementById('content');
const filterInput = document.getElementById('filter');
const sortingInput = document.getElementById('sorting');

const activateElements = els => Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
const allowDifficultySelect = shouldAllow => sortingInput.querySelectorAll('.difficulty')
    .forEach(node => node.disabled = !shouldAllow);

let search, selectr;

function handleDifficulty(difficultyChanged) {
    const {value} = filterInput;
    Array.from(contentEl.getElementsByClassName(ACTIVE_CLASS))
        .forEach(swag => swag.classList.remove(ACTIVE_CLASS));

    if (value === 'alldifficulties') {
        activateElements(contentEl.querySelectorAll('.item'));
        allowDifficultySelect(true);
    } else {
        activateElements(contentEl.getElementsByClassName(value));
        allowDifficultySelect(false);
    }

    if (search && search.has('difficulty')) {
        search.set('difficulty', value);
    }

    if (difficultyChanged && sortingInput.selectedIndex > 1) {
        sortingInput.selectedIndex = 0;
        return true;
    }

    return false;
}

function handleTags() {
    const tags = selectr.getValue();

    if (!tags.length) {
        // history.pushState(null, '', window.location.pathname);
        return;
    }

    Array.from(contentEl.querySelectorAll('.item')).forEach(el => {
        const show = tags.reduce((sho, tag) => sho || el.classList.contains(`tag-${tag}`), false);
        if (!show) {
            el.classList.remove('visible');
        }
    });

    if (search && search.has('tags')) {
        search.set('tags', tags.join(' '));
    }
}

function handleSort() {
    Array.from(contentEl.children)
        .map(child => contentEl.removeChild(child))
        .sort(sort[sortingInput.value])
        .forEach(sortedChild => contentEl.appendChild(sortedChild));

    if (search && search.has('sorting')) {
        search.set('sorting', sortingInput.value);
    }
}

// The cascade is the function which handles calling filtering and sorting swag
function cascade(force = false) {
    force |= handleDifficulty(this === filterInput);
    force |= handleTags(Boolean(this.el));
    if (force || this === sortingInput) {
        handleSort(this === sortingInput);
    }

    const searchString = search.toString();
    if (window.location.search !== searchString) {
        const newRelativePathQuery = `${window.location.pathname}?${searchString}`;
        history.replaceState(null, '', newRelativePathQuery);
    }
}

window.addEventListener('load', () => {
    selectr = new Selectr('#tags', {
        multiple: true,
        placeholder: 'Choose tags...',
        data: window.swagTags.map(tag => ({ value: tag, text: tag }))
    });

    if ('URLSearchParams' in window) {
        search = new URLSearchParams(window.location.search);
        if (search.has('tags')) {
            selectr.setValue(search.get('tags').split(' '));
        }
        if (search.has('difficulty')) {
            const difficulties = ['alldifficulties', 'easy', 'hard', 'medium'];
            if (difficulties.includes(search.get('difficulty'))) {
                filterInput.value = search.get('difficulty');
            }
        }
        if (search.has('sorting')) {
            if (Object.keys(sort).includes(search.get('sorting'))) {
                sortingInput.value = search.get('sorting');
            }
        }
    }

    selectr.on('selectr.change', cascade);
    filterInput.addEventListener('input', cascade);
    sortingInput.addEventListener('input', cascade);

    cascade.call(window, true);
});
