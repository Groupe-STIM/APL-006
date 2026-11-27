(() => {
    const dayMinutes = 780;
    const definitions = [
        { id: 'WEB-03', label: 'YouTube', step: 15, max: 240 },
        { id: 'WEB-07', label: 'Roblox', step: 15, max: 240 },
        { id: 'WEB-06b', label: 'TikTok', step: 15, max: 240 },
        { id: 'WEB-04a', label: 'WhatsApp — appel vidéo', step: 15, max: 180 },
        { id: 'WEB-02', label: 'Netflix', step: 30, max: 240 },
        { id: 'IA-01', label: 'Poser des questions simples à l’IA', step: 1, max: 60, minutes: 1 },
        { id: 'IA-02', label: 'Générer des textes d’une page', step: 1, max: 15, minutes: 10 },
        { id: 'IA-03', label: 'Générer des images', step: 1, max: 15, minutes: 10 },
        { id: 'IA-04', label: 'Générer des vidéos de 3 secondes', step: 1, max: 10, minutes: 20 },
    ];

    const element = (id) => document.getElementById(id);
    const text = (id, content) => { element(id).textContent = content; };
    const show = (id, visible) => { element(id).hidden = !visible; };
    const number = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 });
    const precise = new Intl.NumberFormat('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const percent = new Intl.NumberFormat('fr-CA', { style: 'percent', maximumFractionDigits: 0 });
    const energyLabel = (energy) => `${number.format(energy)}\u00a0Wh`;
    const emissionsLabel = (emissions, format = number) => `${format.format(emissions)}\u00a0g CO₂e`;
    const durationLabel = (minutes) => `${Math.floor(minutes / 60)}\u00a0h ${String(minutes % 60).padStart(2, '0')}\u00a0min`;
    const energyById = new Map(activities.map(([, energy, , id]) => [id, energy]));
    const factorById = new Map(electricitySources.map(([, factor, , id]) => [id, factor]));

    const source = element('day-source');
    const budget = element('day-budget');
    const richSourceSelect = supportsIconOptions();
    for (const [label, , , id] of electricitySources) {
        addIconOption(source, label, id, richSourceSelect);
    }
    source.value = 'HYDRO';
    budget.value = 'Infinity';

    const energyMeter = element('day-energy-meter');
    const gesMeter = element('day-ges-meter');
    const timeMeter = element('day-time-meter');
    const energySegments = energyMeter.querySelector('.day-energy-segments');
    const energyTooltip = energyMeter.querySelector('.energy-segment-tooltip');
    const activityTemplate = element('day-activity-template');
    const rows = definitions.map((definition, index) => {
        const ai = definition.minutes !== undefined;
        const node = activityTemplate.content.firstElementChild.cloneNode(true);
        const [minus, plus] = node.querySelectorAll('button');
        const unitTime = node.querySelector('.day-activity-name small');
        const duration = node.querySelector('.day-activity-duration');
        node.classList.toggle('day-activity-ai', ai);
        duration.hidden = !ai;
        const color = dayActivityColor(definition.id);
        node.style.setProperty('--activity-color', color);
        node.querySelector('img').src = activityIconPath(definition.id);
        node.querySelector('strong').textContent = definition.label;
        minus.setAttribute('aria-label', `Diminuer : ${definition.label}`);
        plus.setAttribute('aria-label', `Augmenter : ${definition.label}`);
        element(ai ? 'day-ai-list' : 'day-digital-list').append(node);

        const segment = document.createElement('span');
        segment.style.backgroundColor = color;
        energySegments.append(segment);
        addEnergySegmentTooltip(segment, energySegments, energyTooltip, definition.label);

        const row = {
            ...definition, ai, minus, plus, unitTime, duration, segment,
            energyPerUnit: energyById.get(definition.id) / (ai ? 1 : 60),
            quantity: node.querySelector('.day-activity-quantity'),
            energy: node.querySelector('.day-activity-energy'),
        };
        minus.addEventListener('click', () => change(index, -1));
        plus.addEventListener('click', () => change(index, 1));
        return row;
    });

    let quantities = definitions.map(() => 0);
    let initialDay = null;
    let confirming = false;
    let finished = false;

    const comparisons = [
        { key: 'energy', label: 'Consommation énergétique', format: energyLabel },
        { key: 'emissions', label: 'Émissions de GES', format: emissionsLabel },
        { key: 'minutes', label: 'Temps connecté', format: (value) => `${value}\u00a0min` },
    ].map((metric) => {
        const node = element('day-comparison-template').content.firstElementChild.cloneNode(true);
        node.querySelector('h3').textContent = metric.label;
        element('day-comparisons').append(node);
        return {
            ...metric,
            variation: node.querySelector('.day-variation'),
            fills: node.querySelectorAll('.day-meter-fill'),
            outputs: node.querySelectorAll('output'),
        };
    });

    function calculateDay() {
        const factor = factorById.get(source.value);
        const contributions = rows.map((row, index) => row.energyPerUnit * quantities[index]);
        const energy = contributions.reduce((sum, value) => sum + value, 0);
        const minutes = rows.reduce((sum, row, index) => sum + (row.minutes ?? 1) * quantities[index], 0);
        return { energy, minutes, contributions, factor, emissions: emissionsFromEnergy(energy, factor) };
    }

    function change(index, direction) {
        const { max, step, minus, plus } = rows[index];
        const active = document.activeElement;
        quantities[index] = Math.max(0, Math.min(max, quantities[index] + direction * step));
        finished = false;
        render();
        if (active === minus && minus.disabled) plus.focus();
        if (active === plus && plus.disabled) minus.focus();
    }

    function updateMarker(meter, percentage, label) {
        const marker = meter.querySelector('.day-target-marker');
        const target = meter.querySelector('.day-target-label');
        marker.hidden = target.hidden = !initialDay;
        meter.classList.toggle('day-meter-with-target', Boolean(initialDay));
        if (initialDay) {
            meter.style.setProperty('--day-target', `${percentage}%`);
            target.textContent = `Objectif : ${label}`;
        }
    }

    function updateTimeMeter(minutes) {
        const ratio = minutes / dayMinutes;
        const width = Math.min(ratio, 1);
        const fill = timeMeter.querySelector('.day-meter-fill');
        const label = timeMeter.querySelector('.day-time-percent');
        fill.style.width = `${width * 100}%`;
        label.textContent = percent.format(ratio);
        const inside = width * timeMeter.clientWidth >= label.offsetWidth + 10;
        timeMeter.classList.toggle('day-percent-inside', inside);
        label.style.left = inside ? `${width * 50}%` : `calc(${width * 100}% + 6px)`;
    }

    function renderComparison(day) {
        show('day-summary', finished);
        if (!finished) return;
        for (const metric of comparisons) {
            const before = initialDay[metric.key];
            const after = day[metric.key];
            const scale = Math.max(before, after) || 1;
            metric.variation.textContent = before ? percent.format(after / before - 1) : '—';
            [before, after].forEach((value, index) => {
                metric.fills[index].style.width = `${value / scale * 100}%`;
                metric.outputs[index].textContent = metric.format(value);
            });
        }
    }

    function render() {
        if (!richSourceSelect) {
            source.style.setProperty('--activity-icon', `url("${activityIconPath(source.value)}")`);
        }
        const day = calculateDay();
        const { energy, emissions, factor, minutes } = day;
        const inChallenge = Boolean(initialDay);
        const limit = inChallenge ? initialDay.energy / 2 : Number(budget.value);
        const unlimited = !Number.isFinite(limit);
        const scale = Math.max(energy, inChallenge ? initialDay.energy : unlimited ? 0 : limit) || 1;
        const overBudget = energy - limit > 1e-9;
        const overTime = minutes > dayMinutes;
        const canStart = energy > 0 && !overTime;

        text('day-instruction', inChallenge
            ? 'Réduis de moitié la consommation énergétique de ta journée.'
            : 'Compose ta journée et observe l’impact de tes choix.');
        show('day-mode', inChallenge);
        text('day-energy', energyLabel(energy));
        element('day-energy').classList.toggle('day-error', overBudget);
        text('day-bike', `${Math.round(energy)}\u00a0min`);
        text('day-ges', emissionsLabel(emissions));
        text('day-ges-scale', emissionsLabel(emissionsFromEnergy(unlimited ? energy : scale, factor)));
        text('day-time', durationLabel(minutes));
        element('day-time').classList.toggle('day-error', overTime);
        text('day-time-warning', `Tu dépasses la durée disponible de ${minutes - dayMinutes} minutes.`);
        show('day-time-warning', overTime);
        updateTimeMeter(minutes);

        rows.forEach((row, index) => {
            const quantity = quantities[index];
            row.quantity.textContent = `${quantity}\u00a0${row.ai ? 'fois' : 'min'}`;
            row.energy.textContent = energyLabel(day.contributions[index]);
            row.segment.style.width = `${day.contributions[index] / scale * 100}%`;
            row.segment.hidden = day.contributions[index] === 0;
            row.minus.disabled = quantity === 0;
            row.plus.disabled = quantity >= row.max;
            row.unitTime.hidden = !row.ai;
            if (row.ai) {
                row.unitTime.textContent = `${row.minutes} min/fois`;
                row.duration.textContent = `${row.minutes * quantity}\u00a0min`;
            }
        });
        gesMeter.querySelector('.day-meter-fill').style.width = `${energy / scale * 100}%`;

        const targetPercentage = inChallenge ? limit / scale * 100 : 0;
        updateMarker(energyMeter, targetPercentage, inChallenge ? energyLabel(limit) : '');
        updateMarker(gesMeter, targetPercentage, inChallenge ? emissionsLabel(emissionsFromEnergy(limit, factor)) : '');

        text('day-budget-status', unlimited ? 'Aucune limite énergétique' : overBudget
            ? `Budget dépassé de ${energyLabel(energy - limit)}`
            : `Budget restant : ${energyLabel(Math.max(0, limit - energy))}`);
        element('day-budget-status').classList.toggle('day-error', overBudget);
        show('day-budget', !inChallenge);
        show('day-challenge-budget', inChallenge);
        if (inChallenge) text('day-challenge-budget', `Budget : ${energyLabel(limit)}`);
        source.disabled = inChallenge;
        show('day-source-lock', inChallenge);
        show('day-original', inChallenge);
        if (inChallenge) {
            const variation = energy / initialDay.energy - 1;
            text('day-original-energy', `Consommation initiale : ${energyLabel(initialDay.energy)}`);
            text('day-energy-change', `${variation > 0 ? 'Augmentation' : 'Réduction'} : ${number.format(Math.abs(variation) * 100)} %`);
        }

        const feedback = element('day-budget-feedback');
        feedback.hidden = unlimited || (!overBudget && overTime);
        feedback.classList.toggle('day-error', overBudget);
        feedback.classList.toggle('day-success', !overBudget);
        feedback.textContent = unlimited ? '' : overBudget
            ? inChallenge ? `Il te reste ${energyLabel(energy - limit)} à économiser.` : 'Ton budget énergétique est dépassé.'
            : inChallenge ? 'Bravo! Tu as réduit ta consommation d’au moins 50 %.' : 'Tu respectes ton budget énergétique!';

        text('day-reset', inChallenge ? 'Restaurer ma journée initiale' : 'Réinitialiser ma journée');
        show('day-offer', !inChallenge);
        element('day-offer').disabled = !canStart;
        element('day-offer').setAttribute('aria-expanded', String(confirming));
        show('day-confirmation', confirming);
        if (confirming) {
            text('day-confirm-energy', energyLabel(energy));
            text('day-confirm-budget', energyLabel(energy / 2));
            text('day-confirm-ges', emissionsLabel(emissions, precise));
            text('day-confirm-target-ges', emissionsLabel(emissions / 2, precise));
        }
        element('day-accept').disabled = !canStart;
        show('day-finish', inChallenge);
        element('day-finish').disabled = overBudget || overTime;
        show('day-free', inChallenge);
        renderComparison(day);
    }

    source.addEventListener('change', render);
    budget.addEventListener('change', render);
    element('day-reset').addEventListener('click', () => {
        quantities = initialDay ? [...initialDay.quantities] : definitions.map(() => 0);
        confirming = finished = false;
        render();
    });
    element('day-offer').addEventListener('click', () => {
        confirming = !confirming;
        render();
    });
    element('day-cancel').addEventListener('click', () => {
        confirming = false;
        render();
        element('day-offer').focus();
    });
    element('day-accept').addEventListener('click', () => {
        const day = calculateDay();
        if (!day.energy || day.minutes > dayMinutes) return;
        initialDay = { ...day, quantities: [...quantities] };
        confirming = finished = false;
        render();
        element('day-reset').focus();
    });
    element('day-free').addEventListener('click', () => {
        quantities = [...initialDay.quantities];
        initialDay = null;
        budget.value = 'Infinity';
        finished = false;
        render();
        element('day-offer').focus();
    });
    element('day-finish').addEventListener('click', () => {
        finished = true;
        render();
        element('day-summary-title').focus();
    });

    render();
    new ResizeObserver(() => updateTimeMeter(calculateDay().minutes)).observe(timeMeter);
})();
