// Source : onglet Journée d’Alex du classeur activites_ia.xlsx.
const alexDay = [
    {"time": "8 h 30 à 9 h", "place": "À la maison", "title": "Le petit déjeuner", "items": [{"description": "Tout en prenant son petit-déjeuner, Alex regarde des vidéos de ses youtubeurs préférés sur sa tablette.", "label": "YouTube — 30 minutes", "id": "WEB-03", "units": 0.5, "minutes": 30}]},
    {"time": "9 h à 10 h", "place": "À la maison", "title": "Une partie avec ses amis", "items": [{"description": "Alex joue à Roblox sur sa tablette avec ses amis.", "label": "Roblox — 1 heure", "id": "WEB-07", "units": 1.0, "minutes": 60}]},
    {"time": "10 h à 10 h 30", "place": "À la maison", "title": "Préparation pour le soccer", "items": [{"description": "Alex prépare son lunch, remplit sa bouteille d'eau et rassemble son équipement de soccer avant de partir.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 30}]},
    {"time": "10 h 30 à 11 h", "place": "En déplacement", "title": "En route vers le centre sportif", "items": [{"description": "Alex prend l'autobus pour rejoindre ses amis. Pour passer le temps, il regarde des vidéos sur TikTok.", "label": "TikTok — 30 minutes", "id": "WEB-06", "units": 0.5, "minutes": 30}]},
    {"time": "11 h à 13 h", "place": "Au centre sportif", "title": "Place au soccer!", "items": [{"description": "Alex joue au soccer avec ses amis pendant deux heures. Son cellulaire reste dans son sac.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 120}]},
    {"time": "13 h à 13 h 30", "place": "Au centre sportif", "title": "Le lunch entre amis", "items": [{"description": "Après leur partie de soccer, Alex et ses amis mangent ensemble et discutent des meilleurs moments du match.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 30}]},
    {"time": "13 h 30 à 14 h", "place": "En déplacement", "title": "Le retour à la maison", "items": [{"description": "Pendant son trajet de retour en autobus, Alex fait un appel vidéo sur WhatsApp avec un ami pour lui raconter sa partie de soccer.", "label": "WhatsApp vidéo — 30 minutes", "id": "WEB-04", "units": 0.5, "minutes": 30}]},
    {"time": "14 h à 14 h 30", "place": "À la maison", "title": "Un peu de curiosité", "items": [{"description": "Alex aimerait améliorer ses performances au soccer. Il pose quelques questions à une intelligence artificielle sur les techniques de dribble et les stratégies d'équipe.", "label": "IA — 5 questions simples", "id": "IA-01", "units": 5.0, "minutes": 24}, {"description": "Il demande ensuite à l'IA de lui proposer un programme d'entraînement détaillé pour améliorer ses tirs au but.", "label": "IA — Génération d'un texte d'une page", "id": "IA-02", "units": 1.0, "minutes": 6}]},
    {"time": "14 h 30 à 15 h", "place": "À la maison", "title": "Un projet créatif avec l'IA", "items": [{"description": "Alex et ses amis ont donné un nom à leur équipe de soccer. Il décide de créer un logo pour leur équipe à l'aide de l'intelligence artificielle.", "label": "IA — Génération d'une image", "id": "IA-03", "units": 1.0, "minutes": 15}, {"description": "Il trouve le résultat amusant et décide de créer une courte vidéo d'un ballon de soccer enflammé aux couleurs de son équipe.", "label": "IA — Génération d'une vidéo de 3 secondes", "id": "IA-04", "units": 1.0, "minutes": 15}]},
    {"time": "15 h à 17 h", "place": "À la maison", "title": "Les devoirs et un peu de temps libre", "items": [{"description": "Alex prend une douche, consacre une heure à ses devoirs dans ses cahiers scolaires, puis lit quelques chapitres d'un roman.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 120}]},
    {"time": "17 h à 17 h 30", "place": "À la maison", "title": "Encore un peu de Roblox", "items": [{"description": "Avant le souper, Alex retrouve ses amis en ligne pour une dernière partie de Roblox.", "label": "Roblox — 30 minutes", "id": "WEB-07", "units": 0.5, "minutes": 30}]},
    {"time": "17 h 30 à 18 h", "place": "À la maison", "title": "Un coup de main en cuisine", "items": [{"description": "Alex aide ses parents à préparer le souper et à mettre la table.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 30}]},
    {"time": "18 h à 19 h", "place": "À la maison", "title": "Un souper en famille, sans écran", "items": [{"description": "Toute la famille se retrouve autour de la table. Les cellulaires et les tablettes sont mis de côté. Chacun raconte sa journée.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 60}]},
    {"time": "19 h à 21 h", "place": "À la maison", "title": "Une soirée cinéma", "items": [{"description": "Après le souper, Alex s'installe confortablement et regarde un film sur Netflix, sur sa tablette.", "label": "Netflix — 2 heures", "id": "WEB-02", "units": 2.0, "minutes": 120}]},
    {"time": "21 h à 21 h 30 h", "place": "À la maison", "title": "La fin de la journée", "items": [{"description": "Alex se prépare pour la nuit, lit un peu et se couche.", "label": "Aucune activité numérique.", "id": "NONE", "units": 0.0, "minutes": 30}]},
];

const activityEnergy = new Map(activities.map(([, energy, , id]) => [id, energy]));
const [hydroName, hydroFactor] = electricitySources.find((source) => source[3] === 'HYDRO');
const timeline = document.querySelector('#alex-timeline');
const eventTemplate = document.querySelector('#alex-event');
const activityTotals = new Map();
let totalMinutes = 0;
let connectedMinutes = 0;
let totalEnergy = 0;

for (const { time, place, title, items } of alexDay) {
    const event = eventTemplate.content.cloneNode(true);
    event.querySelector('.alex-time').textContent = time;
    event.querySelector('.alex-place').textContent = place;
    event.querySelector('h2').textContent = title;
    const details = event.querySelector('.alex-event-details');

    for (const { description, label, id, units, minutes } of items) {
        const category = id === 'NONE' ? 'offline' : id.startsWith('IA-') ? 'ai' : 'digital';
        totalMinutes += minutes;
        if (category !== 'offline') {
            connectedMinutes += minutes;
            const energy = activityEnergy.get(id) * units;
            totalEnergy += energy;
            const entry = activityTotals.get(id) ?? {
                name: category === 'ai' ? label.split(' — ')[1] : label.split(' — ')[0],
                energy: 0,
                minutes: 0,
            };
            entry.energy += energy;
            entry.minutes += minutes;
            activityTotals.set(id, entry);
        }

        const paragraph = document.createElement('p');
        paragraph.textContent = description;
        const tag = document.createElement('span');
        tag.className = 'alex-tag';
        tag.dataset.category = category;
        tag.textContent = label;
        details.append(paragraph, tag);
    }

    timeline.append(event);
}

const wholeNumber = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 });
document.querySelector('#alex-energy').textContent = `${wholeNumber.format(totalEnergy)}\u00a0Wh`;
document.querySelector('#alex-bike').textContent = `≈ ${formatDayDuration(totalEnergy)}`;
document.querySelector('#alex-emissions').textContent = `${wholeNumber.format(emissionsFromEnergy(totalEnergy, hydroFactor))}\u00a0g CO₂e`;
document.querySelector('#alex-hydro').textContent = `Source : ${hydroName}`;

const bar = document.querySelector('#alex-energy-stack');
const energyTooltip = document.querySelector('#alex-energy-tooltip');
const segmentLegend = document.querySelector('#alex-segment-legend');
const activityList = document.querySelector('#alex-activity-list');
const aiList = document.querySelector('#alex-ai-list');
const activityRow = document.querySelector('#alex-activity-row');
const activityNumber = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 });
for (const [id, { name, energy, minutes }] of activityTotals) {
    const color = dayActivityColor(id);
    const block = document.createElement('span');
    block.style.width = `${totalEnergy ? energy / totalEnergy * 100 : 0}%`;
    block.style.backgroundColor = color;
    bar.append(block);
    addEnergySegmentTooltip(block, bar, energyTooltip, name);

    const label = document.createElement('li');
    label.style.setProperty('--segment-color', color);
    label.textContent = name;
    segmentLegend.append(label);

    const row = activityRow.content.firstElementChild.cloneNode(true);
    row.style.setProperty('--activity-color', color);
    row.querySelector('img').src = activityIconPath(id);
    row.querySelector('strong').textContent = name;
    row.querySelector('.day-activity-duration').textContent = formatDayDuration(minutes);
    row.querySelector('.day-activity-energy').textContent = `${activityNumber.format(energy)}\u00a0Wh`;
    const list = id.startsWith('IA-') ? aiList : activityList;
    list.append(row);
}

document.querySelector('#alex-ges-fill').style.width = totalEnergy > 0 ? '100%' : '0%';
const percent = new Intl.NumberFormat('fr-CA', { style: 'percent', maximumFractionDigits: 0 });
const connectedShare = totalMinutes ? connectedMinutes / totalMinutes : 0;
document.querySelector('#alex-connected-time').textContent = formatDayDuration(connectedMinutes);
const connectedFill = document.querySelector('#alex-connected-fill');
connectedFill.style.width = `${connectedShare * 100}%`;
connectedFill.textContent = percent.format(connectedShare);
