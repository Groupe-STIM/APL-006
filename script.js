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

const whLink = document.querySelector('#wh-link');
const whDialog = document.querySelector('#wh-dialog');

if (whLink && whDialog?.showModal) {
    whLink.addEventListener('click', (event) => {
        event.preventDefault();
        whDialog.showModal();
    });
}

const duelForm = document.querySelector('#duel-form');

if (duelForm) {
    const sides = Array.from(duelForm.querySelectorAll('.duel-side'), (side) => ({
        heading: side.querySelector('.duel-activity'),
        select: side.querySelector('select'),
        help: side.querySelector('.activity-help'),
        message: side.querySelector('.activity-message'),
        chart: side.querySelector('.duel-chart'),
        bar: side.querySelector('.energy-bar'),
        value: side.querySelector('.energy-value'),
        factor: side.querySelector('.energy-factor-badge'),
        bike: side.querySelector('.energy-bike span'),
    }));
    const numberFormat = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 10 });
    const decimalFactorFormat = new Intl.NumberFormat('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const integerFactorFormat = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const richSelect = CSS.supports('appearance', 'base-select') && CSS.supports('selector(::picker(select))');
    let animations = [];

    const preset = duelForm.hasAttribute('data-preset');
    const requested = Number(new URLSearchParams(window.location.search).get('duel'));
    const duelNumber = preset && duelMatchups[requested - 1] ? requested : 1;
    const matchup = preset ? duelMatchups[duelNumber - 1] : [];
    const storageKey = `${duelStoragePrefix}${duelNumber}:${JSON.stringify(matchup)}`;
    let saved;

    if (preset) {
        try {
            saved = JSON.parse(sessionStorage.getItem(storageKey));
        } catch {
            // Comparisons still work when the browser blocks session storage.
        }

        for (const [direction, offset] of [['previous', -1], ['next', 1]]) {
            const arrow = document.querySelector(`#duel-${direction}`);
            const target = duelNumber + offset;
            if (duelMatchups[target - 1]) {
                arrow.href = `?duel=${target}`;
            } else {
                arrow.setAttribute('aria-disabled', 'true');
            }
        }
    }

    function updateHelp(side, activity) {
        const explanation = activity[2] ?? '';
        side.message.textContent = explanation;
        side.help.hidden = !explanation.trim();
        side.help.open = false;
    }

    for (const [sideIndex, side] of sides.entries()) {
        const { select, heading } = side;
        const id = matchup[sideIndex] ?? 'any';

        if (id.toLowerCase() !== 'any') {
            side.fixedActivity = activities.find((activity) => activity[3] === id);
            heading.querySelector('img').src = `images/${id}.png`;
            heading.querySelector('span').textContent = side.fixedActivity[0];
            updateHelp(side, side.fixedActivity);
            continue;
        }

        if (heading) heading.hidden = true;
        select.hidden = false;
        select.disabled = false;
        for (const [description, , , activityId] of activities) {
            const option = new Option(description, activityId);
            if (richSelect) {
                const icon = document.createElement('img');
                icon.className = 'activity-icon';
                icon.src = `images/${activityId}.png`;
                icon.alt = '';
                option.prepend(icon);
            }
            select.add(option);
        }
        const savedIndex = activities.findIndex((activity) => activity[3] === saved?.ids?.[sideIndex]);
        select.selectedIndex = savedIndex < 0 ? sideIndex : savedIndex;

        function updateSelection() {
            const activity = activities[select.selectedIndex];
            if (!richSelect) {
                select.style.setProperty('--activity-icon', `url("images/${activity[3]}.png")`);
            }
            updateHelp(side, activity);
        }

        updateSelection();
        select.addEventListener('change', updateSelection);
    }

    function selectedActivities() {
        return sides.map(({ fixedActivity, select }) => fixedActivity ?? activities[select.selectedIndex]);
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

        const quantities = selectedActivities().map((activity) => activity[1]);
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
                const wattHours = quantities[index];
                value.textContent = `${numberFormat.format(wattHours)}\u00a0Wh`;
                if (bike) {
                    // À 60 W, une minute de vélo correspond à 1 Wh.
                    const duration = wattHours < 1
                        ? `${Math.round(wattHours * 60)}\u00a0s`
                        : `${integerFactorFormat.format(wattHours)}\u00a0min`;
                    bike.textContent = `≈ ${duration}`;
                }
            }
            const { factor } = sides[quantities.indexOf(maximum)] ?? {};
            if (factor && minimum > 0 && maximum > minimum) {
                const quotient = maximum / minimum;
                const ratio = (quotient >= 3 ? integerFactorFormat : decimalFactorFormat).format(quotient);
                factor.textContent = `${ratio}x`;
                factor.setAttribute('aria-label', `${ratio} fois l’énergie de l’autre activité`);
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
