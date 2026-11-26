function emissionsFromEnergy(wattHours, factor) {
    return (wattHours / 1000) * factor;
}

function activityIconPath(id) {
    return `images/${id === 'WEB-04a' ? 'WEB-04' : id}.png`;
}

function supportsIconOptions() {
    return CSS.supports('appearance', 'base-select') && CSS.supports('selector(::picker(select))');
}

function addIconOption(select, label, id, richSelect) {
    const option = new Option(label, id);
    if (richSelect) {
        const icon = document.createElement('img');
        icon.className = 'activity-icon';
        icon.src = activityIconPath(id);
        icon.alt = '';
        option.prepend(icon);
    }
    select.add(option);
}

const duelStoragePrefix = 'apl-006:duel:';
const readyLink = document.querySelector('.duel-ready');

readyLink?.addEventListener('click', () => {
    try {
        for (let index = sessionStorage.length - 1; index >= 0; index--) {
            const key = sessionStorage.key(index);
            if (key?.startsWith(duelStoragePrefix)) {
                sessionStorage.removeItem(key);
            }
        }
    } catch {
        // The link still starts the duel when storage is unavailable.
    }
});

for (const link of document.querySelectorAll('[data-dialog]')) {
    const dialog = document.getElementById(link.dataset.dialog);
    if (!dialog?.showModal) continue;
    link.addEventListener('click', (event) => {
        event.preventDefault();
        dialog.showModal();
    });
}

const duelForm = document.querySelector('#duel-form');

if (duelForm) {
    function picker(panel) {
        return {
            heading: panel.querySelector('.duel-activity'),
            select: panel.querySelector('select'),
            help: panel.querySelector('.activity-help'),
            message: panel.querySelector('.activity-message'),
        };
    }

    const sides = Array.from(duelForm.querySelectorAll('.duel-side'), (side) => ({
        ...picker(side),
        chart: side.querySelector('.duel-chart'),
        bar: side.querySelector('.energy-bar'),
        value: side.querySelector('.energy-value'),
        factor: side.querySelector('.energy-factor-badge'),
        bike: side.querySelector('.energy-bike span'),
    }));
    const numberFormat = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 10 });
    const decimalFactorFormat = new Intl.NumberFormat('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const integerFactorFormat = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 });
    const smallEmissionFormat = new Intl.NumberFormat('fr-CA', { maximumSignificantDigits: 1 });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const richSelect = supportsIconOptions();
    let animations = [];

    const preset = duelForm.hasAttribute('data-preset');
    const pollution = duelForm.hasAttribute('data-pollution');
    const matchups = pollution ? pollutionMatchups : preset ? duelMatchups : [];
    const requested = Number(new URLSearchParams(window.location.search).get('duel'));
    const duelNumber = matchups[requested - 1] ? requested : 1;
    const matchup = matchups[duelNumber - 1] ?? [];
    const storageKey = `${duelStoragePrefix}${duelNumber}:${JSON.stringify(matchup)}`;
    let saved;

    if (preset) {
        try {
            saved = JSON.parse(sessionStorage.getItem(storageKey));
        } catch {
            // Comparisons still work when the browser blocks session storage.
        }
    }
    if (matchups.length) {
        for (const [direction, offset] of [['previous', -1], ['next', 1]]) {
            const arrow = document.querySelector(`#duel-${direction}`);
            const target = duelNumber + offset;
            if (matchups[target - 1]) {
                arrow.href = `?duel=${target}`;
            } else {
                arrow.setAttribute('aria-disabled', 'true');
            }
        }
    }

    function updateHelp(side, activity) {
        const explanation = activity[2] ?? '';
        if (Array.isArray(explanation)) {
            const content = explanation.map(([text, bold]) => {
                if (!bold) return document.createTextNode(text);
                const emphasis = document.createElement('strong');
                emphasis.textContent = text;
                return emphasis;
            });
            side.message.replaceChildren(...content);
        } else {
            side.message.textContent = explanation;
        }
        side.help.hidden = !side.message.textContent.trim();
        side.help.open = false;
    }

    function configurePicker(side, entries, id, defaultIndex, savedId) {
        const { select, heading } = side;
        if (id.toLowerCase() !== 'any') {
            const entry = entries.find((activity) => activity[3] === id);
            heading.querySelector('img').src = activityIconPath(id);
            heading.querySelector('span').textContent = entry[0];
            updateHelp(side, entry);
            return () => entry;
        }

        if (heading) heading.hidden = true;
        select.hidden = false;
        select.disabled = false;
        for (const [description, , , activityId] of entries) {
            addIconOption(select, description, activityId, richSelect);
        }
        const savedIndex = entries.findIndex((activity) => activity[3] === savedId);
        select.selectedIndex = savedIndex < 0 ? defaultIndex : savedIndex;

        const selection = () => entries[select.selectedIndex];

        function updateSelection() {
            const activity = selection();
            if (!richSelect) {
                select.style.setProperty('--activity-icon', `url("${activityIconPath(activity[3])}")`);
            }
            updateHelp(side, activity);
        }

        updateSelection();
        select.addEventListener('change', updateSelection);
        return selection;
    }

    const pollutionActivity = pollution
        ? configurePicker(picker(duelForm.querySelector('.pollution-activity')), activities, matchup[0], 0)
        : null;
    const choices = pollution ? electricitySources : activities;
    const sourceIds = pollution ? matchup.slice(1) : matchup;
    const selections = sides.map((side, index) =>
        configurePicker(side, choices, sourceIds[index] ?? 'any', index, saved?.ids?.[index]));

    function selectedActivities() {
        return selections.map((selection) => selection());
    }

    function saveComparison(compared) {
        if (preset) {
            try {
                const ids = selectedActivities().map((activity) => activity[3]);
                sessionStorage.setItem(storageKey, JSON.stringify({ ids, compared }));
            } catch {
                // Storage availability depends on browser settings.
            }
        }
    }

    function clearComparison() {
        for (const animation of animations) {
            animation.cancel();
        }
        animations = [];

        for (const { chart, value, bike } of sides) {
            chart.style.removeProperty('--bar-height');
            delete chart.dataset.consumption;
            value.textContent = '';
            if (bike) bike.textContent = '';
        }
        for (const { factor } of sides) {
            if (factor) factor.hidden = true;
        }
    }

    async function showComparison(animate) {
        clearComparison();

        const quantities = selectedActivities().map((activity) => pollution
            ? emissionsFromEnergy(pollutionActivity()[1], activity[1])
            : activity[1]);
        const minimum = Math.min(...quantities);
        const maximum = Math.max(...quantities) || 1;
        const comparison = animations;

        for (const [index, { chart, bar }] of sides.entries()) {
            chart.style.setProperty('--bar-height', `${(quantities[index] / maximum) * 100}%`);
            chart.dataset.consumption = quantities[0] === quantities[1]
                ? 'equal'
                : quantities[index] === minimum ? 'lower' : 'higher';
            if (animate && !reducedMotion.matches) {
                comparison.push(bar.animate(
                    [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
                    { duration: 1200, easing: 'ease-out' },
                ));
            }
        }

        if (comparison.length) {
            await Promise.allSettled(comparison.map((animation) => animation.finished));
        }
        if (comparison === animations) {
            for (const [index, { value, bike }] of sides.entries()) {
                const quantity = quantities[index];
                const unit = pollution ? 'gCO₂e' : 'Wh';
                let quantityFormat = numberFormat;
                if (pollution) {
                    if (quantity >= 3) {
                        quantityFormat = integerFactorFormat;
                    } else if (quantity > 0 && quantity < 1) {
                        quantityFormat = smallEmissionFormat;
                    } else {
                        quantityFormat = decimalFactorFormat;
                    }
                }
                value.textContent = `${quantityFormat.format(quantity)}\u00a0${unit}`;
                if (bike) {
                    // À 60 W, une minute de vélo correspond à 1 Wh.
                    const minutes = Math.round(quantity);
                    let duration = `${minutes}\u00a0min`;
                    if (quantity < 1) {
                        duration = `${Math.round(quantity * 60)}\u00a0s`;
                    } else if (quantity > 60) {
                        duration = `${Math.floor(minutes / 60)}\u00a0h ${minutes % 60}\u00a0min`;
                    }
                    bike.textContent = `≈ ${duration}`;
                }
            }
            const { factor } = sides[quantities.indexOf(maximum)] ?? {};
            if (factor && minimum > 0 && maximum > minimum) {
                const quotient = maximum / minimum;
                const ratio = (quotient >= 3 ? integerFactorFormat : decimalFactorFormat).format(quotient);
                factor.textContent = `${ratio}x`;
                factor.setAttribute('aria-label', pollution
                    ? `${ratio} fois les émissions de l’autre source`
                    : `${ratio} fois l’énergie de l’autre activité`);
                factor.hidden = false;
            }
        }
    }

    duelForm.addEventListener('change', () => {
        clearComparison();
        saveComparison(false);
    });
    duelForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveComparison(true);
        showComparison(true);
    });

    if (saved?.compared && selectedActivities().every((activity, index) => activity[3] === saved.ids[index])) {
        showComparison(false);
    }

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted || !preset) return;
        try {
            const state = JSON.parse(sessionStorage.getItem(storageKey));
            if (state?.compared && selectedActivities().every((activity, index) => activity[3] === state.ids[index])) {
                showComparison(false);
            }
        } catch {
            // The cached page already preserves its displayed result.
        }
    });
}
