// Source : onglet Activités du classeur activites_ia.xlsx.
// Chaque ligne contient le nom (B), l’énergie en Wh (C), le message (D) et l’identifiant (A).
const activities = [
    ["Poser une question simple à l’IA", 0.34, "Réponse d’environ 30 mots", "IA-01"],
    ["Générer avec l'IA un texte d'une page", 2.4, "Réponse élaborée d’environ 500 mots", "IA-02"],
    ["Générer avec l'IA une image", 4, "Image de 1024 × 1024 pixels à partir d’une description", "IA-03"],
    ["Générer avec l'IA une vidéo de 3 secondes", 260, "Vidéo de 3 secondes à partir d’une description", "IA-04"],
    ["Générer avec l'IA 100 lignes de code", 4, "Avec Codex à partir d’une consigne précise", "IA-05"],
    ["Faire une recherche Google classique", 0.3, "Sans résumé généré par l’IA (-ia)", "WEB-01"],
    ["Regarder 1 h de Netflix sur iPad à la maison", 93, "via WiFi", "WEB-02"],
    ["Regarder YouTube pendant 1h à la maison", 37.4, "via Wi-Fi", "WEB-03"],
    ["Faire un appel vidéo (WhatsApp) de 1 h avec mon ami.e à l'extérieur (4G/5G)", 71.4, "via 4G/5G", "WEB-04"],
    ["Faire un appel audio (WhatsApp) de 1 h avec mon ami.e à l'extérieur (4G/5G)", 4.1, "via 4G/5G", "WEB-05"],
    ["Regarder TikTok pendant 1h à l'extérieur (4G/5G)", 87.4, "via 4G/5G", "WEB-06"],
    ["Regarder TikTok pendant 1h à la maison", 30.2, "via Wifi", "WEB-06b"],
    ["Jouer à Roblox pendant 1 h sur iPad à la maison", 9.5, "via Wi-Fi (par joueur)", "WEB-07"],
];
