# Défi 4 — Ma journée numérique, mes choix

## Intégration APL-006
Le HTML autonome joint est la référence visuelle et comportementale. Adapter à la charte, aux composants et à l’architecture existants. Ne pas modifier les autres défis. Présenter un plan avant implantation. Remplacer les coefficients provisoires par les données officielles du projet après vérification des unités et du périmètre (réseaux et serveurs, hors appareils utilisateurs). Toutes les activités sont supposées à domicile en Wi-Fi, séquentielles. Aucun accès réseau nécessaire pour le prototype.

## Interface
Ordre : titre, consigne, énergie (Wh et équivalent vélo), GES (g CO₂e et source), temps connecté, activités numériques, activités IA, boutons et bilan. Énergie : barre segmentée par activité, couleur identique à son repère. GES : une seule couleur gris foncé #555. Temps : gris foncé connecté, gris clair restant, pourcentage blanc centré dans le segment connecté (à côté si trop étroit). Aucune légende sous cette barre. Durée connectée en gros au-dessus. Pas d’affichage explicite des 13 h. Contrôles +/−, quantité et énergie par activité. Afficher la durée unitaire et totale des activités IA.

## Données provisoires
| Activité | Unité | Wh/unité | Pas | Maximum | Minutes/unité | Initial |
|---|---|---:|---:|---:|---:|---:|
| YouTube | min | 0,35 | 15 | 240 | 1 | 30 |
| Roblox | min | 7/60 | 15 | 240 | 1 | 60 |
| TikTok | min | 0,35 | 15 | 240 | 1 | 30 |
| WhatsApp audio | min | 4/60 | 15 | 180 | 1 | 30 |
| WhatsApp vidéo | min | 0,5 | 15 | 180 | 1 | 15 |
| Netflix | min | 21/60 | 30 | 240 | 1 | 120 |
| Question simple IA | question | 0,34 | 1 | 60 | 1 | 5 |
| Texte une page | texte | 2,4 | 1 | 15 | 10 | 1 |
| Image IA | image | 4 | 1 | 15 | 10 | 1 |
| Vidéo IA 3 s | vidéo | 260 | 1 | 10 | 20 | 0 |

Sources (g CO₂e/kWh) : hydroélectricité 24 (défaut), solaire 48, éolien 11, nucléaire 12, gaz naturel 490, charbon 820. Hypothèse simplificatrice : une seule source pour toutes les activités. Les durées IA représentent le temps d’interaction, non le temps de calcul serveur.

## Calculs
- E = somme des quantités × Wh/unité. G = E × facteur / 1000. T = somme des quantités × minutes/unité.
- Vélo : arrondir E en minutes (hypothèse 60 W mécaniques). Temps disponible : 780 min. Pourcentage = arrondi(100 × T/780). Signaler tout dépassement; barre plafonnée à 100 % de largeur, mais afficher le pourcentage réel.
- Calculer sans arrondis intermédiaires. Afficher au plus une décimale pour les Wh et GES, sauf confirmation du défi : GES à deux décimales.

## Mode libre
Démarrer avec budget illimité, source hydro et valeurs initiales du tableau. Budgets facultatifs : 100, 150, 200, 300, 500 Wh. En illimité, barres énergie et GES remplies si E > 0, vides sinon. Avec budget, échelle = max(E, budget), GES proportionnels. Afficher budget restant/dépassé et message de respect du budget si T ≤ 780. Réinitialiser met toutes les quantités à zéro sans changer source ou budget. Bouton « Relever le défi des 50 % » sous réinitialiser; désactivé si E = 0 ou T > 780.

## Confirmation et défi
Confirmation intégrée sous le bouton : titre, question « Serais-tu capable de passer une journée tout aussi agréable en consommant deux fois moins d’énergie? », deux colonnes consommation actuelle et nouveau budget (E/2), GES plus petits sous chaque Wh (G et G/2, deux décimales). Boutons « Je relève le défi! » et « Continuer à composer ma journée ».
À l’acceptation, mémoriser quantités, E, G, T; verrouiller la source. Budget = E initial/2, échelle = max(E initial, E courant). Afficher sur les deux barres un marqueur vertical blanc à budget/échelle, avec contour gris pour visibilité, et objectif dans l’unité correspondante au-dessus. Les marqueurs restent alignés. Afficher consommation initiale, réduction ou augmentation en pourcentage et budget restant/dépassé. Aucun objectif de réduction du temps connecté. Restaurer la journée initiale remet les quantités mémorisées sans quitter le défi. Revenir au mode libre restaure ces quantités et le budget illimité, déverrouille la source.

## Bilan
« Terminer le défi » activé uniquement si E ≤ budget et T ≤ 780. Afficher « Mon bilan numérique » avec trois paires de barres avant (gris clair) et après (gris foncé), valeurs et variations relatives : énergie, GES, temps connecté en minutes. Échelle commune à chaque paire. Message « Défi réussi! ». Toute modification des quantités masque le bilan jusqu’à nouvelle validation.

## Critères de validation
- État initial : 87,6 Wh, 2,1024 g CO₂e, 310 min (5 h 10), 40 %; équivalent vélo 88 min.
- Confirmation : 87,6 / 43,8 Wh et 2,10 / 1,05 g CO₂e.
- Défi : les deux marqueurs à mi-largeur au départ; source verrouillée. Supprimer Netflix (120 min) économise 42 Wh; retirer encore 15 min YouTube permet d’atteindre 40,35 Wh, donc réussite.
- Ajouter une vidéo IA augmente E de 260 Wh et T de 20 min; les marqueurs restent à leur position relative correcte si l’échelle augmente.
- Tester zéro, limites +/−, dépassement 780 min, changement de source en mode libre, annulation, restauration, retour libre et bilan.
- Vérifier l’ergonomie Chromebook, navigation clavier, lisibilité et absence de régression des autres défis.

## Limites de référence
Le HTML est une reproduction autonome, non une implantation dans le dépôt APL-006. Les icônes et détails typographiques peuvent différer du rendu ChatGPT. Les coefficients sont provisoires; ne pas les présenter comme des mesures validées. Le modèle ne gère pas les activités simultanées.
