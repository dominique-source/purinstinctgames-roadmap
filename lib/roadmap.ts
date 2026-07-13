export type Locale = "en" | "fr";

export interface Localized {
  en: string;
  fr: string;
}

export function t(value: Localized, locale: Locale): string {
  return value[locale];
}

export type Owner = "Dominique" | "François" | "Open";

export interface Task {
  id: string;
  title: Localized;
  detail?: Localized;
  suggestedOwner: Owner;
}

export interface Milestone {
  id: string;
  code: string; // M1..M12
  title: Localized;
  goal: Localized;
  window: Localized;
  track: "Raise" | "Games" | "INSTINCT" | "Partners";
  tasks: Task[];
}

export interface Phase {
  id: string;
  name: Localized;
  dates: Localized;
  intent: Localized;
  milestones: Milestone[];
}

export interface Criterion {
  id: string;
  text: Localized;
}

export interface Checkpoint {
  id: string;
  code: string;
  day: Localized;
  criteria: Criterion[];
  afterPhase: string; // phase id it follows
}

export const SPRINT = {
  title: { en: "PürInstinct — 60-Day Blueprint", fr: "PürInstinct — Plan des 60 jours" },
  subtitle: {
    en: "Seed CAD $750K @ $4.0M pre-money · Games + INSTINCT in parallel",
    fr: "Ronde d'amorçage 750 K$ CA @ 4,0 M$ pré-money · Games + INSTINCT en parallèle",
  },
  range: { en: "July 13 — September 13, 2026", fr: "13 juillet — 13 septembre 2026" },
};

export const phases: Phase[] = [
  {
    id: "p1",
    name: { en: "Phase 1 — Foundation", fr: "Phase 1 — Fondations" },
    dates: { en: "Weeks 1–2 · Jul 13–26", fr: "Semaines 1–2 · 13–26 juil." },
    intent: {
      en: "Lock the dataroom, the raise mechanics and the INSTINCT package so every meeting after week 2 is a selling meeting, not a preparing meeting.",
      fr: "Verrouiller la dataroom, la mécanique de la ronde et le dossier INSTINCT pour que chaque rencontre après la semaine 2 soit une rencontre de vente, pas de préparation.",
    },
    milestones: [
      {
        id: "m1",
        code: "M1",
        title: { en: "Investor dataroom locked", fr: "Dataroom investisseurs verrouillée" },
        goal: {
          en: "A complete, zero-surprise dataroom any investor can enter within 24h of a first meeting.",
          fr: "Une dataroom complète et sans surprise, accessible à tout investisseur dans les 24h suivant une première rencontre.",
        },
        window: { en: "Jul 13–24", fr: "13–24 juil." },
        track: "Raise",
        tasks: [
          { id: "m1t1", title: { en: "Deck v2 final (EN)", fr: "Deck v2 final (EN)" }, detail: { en: "Integrate showcase-event slide + verified comparables. Export PDF + PPTX.", fr: "Intégrer la diapo de l'événement showcase + comparables vérifiés. Exporter en PDF + PPTX." }, suggestedOwner: "Dominique" },
          { id: "m1t2", title: { en: "Financial model + assumptions memo", fr: "Modèle financier + mémo des hypothèses" }, detail: { en: "Model v9 export + 1-page memo explaining every hardcoded assumption (licence medians, volumes, capacity).", fr: "Export du modèle v9 + mémo d'une page expliquant chaque hypothèse (médianes de licence, volumes, capacité)." }, suggestedOwner: "Dominique" },
          { id: "m1t3", title: { en: "Cap table + valuation defense", fr: "Cap table + défense de la valorisation" }, detail: { en: "Current cap table, $4.0M pre-money rationale (Berkus / Scorecard / RFS / VC method summary).", fr: "Cap table actuelle, justification des 4,0 M$ pré-money (résumé méthodes Berkus / Scorecard / RFS / VC)." }, suggestedOwner: "François" },
          { id: "m1t4", title: { en: "Legal pack: NDA + SAFE/convertible template", fr: "Pochette légale : NDA + gabarit SAFE/convertible" }, detail: { en: "Confirm instrument with counsel; standard terms sheet ready to send.", fr: "Confirmer l'instrument avec l'avocat; term sheet standard prête à envoyer." }, suggestedOwner: "François" },
          { id: "m1t5", title: { en: "One-page teaser EN + FR", fr: "Teaser une page EN + FR" }, detail: { en: "Traction, model, raise ask. The email attachment for every warm intro.", fr: "Traction, modèle, montant recherché. La pièce jointe pour chaque intro chaleureuse." }, suggestedOwner: "Dominique" },
          { id: "m1t6", title: { en: "Dataroom folder assembled + access flow", fr: "Dossier dataroom assemblé + flux d'accès" }, detail: { en: "Corporate docs, trademark file, insurance, key contracts. Single link, tracked access.", fr: "Docs corporatifs, dossier de marque, assurances, contrats clés. Un seul lien, accès suivi." }, suggestedOwner: "Open" },
        ],
      },
      {
        id: "m2",
        code: "M2",
        title: { en: "Raise strategy & pipeline armed", fr: "Stratégie de levée & pipeline armé" },
        goal: {
          en: "Target list live, warm paths mapped, pitch rehearsed. 15 first meetings booked by end of Phase 2.",
          fr: "Liste de cibles active, chemins chaleureux cartographiés, pitch répété. 15 premières rencontres réservées d'ici la fin de la Phase 2.",
        },
        window: { en: "Jul 13–26", fr: "13–26 juil." },
        track: "Raise",
        tasks: [
          { id: "m2t1", title: { en: "Target list loaded into CRM / tracker", fr: "Liste de cibles chargée dans le CRM / suivi" }, detail: { en: "Import PurInstinct_Target_List.xlsx; statuses + next actions per name.", fr: "Importer PurInstinct_Target_List.xlsx; statuts + prochaines actions par nom." }, suggestedOwner: "François" },
          { id: "m2t2", title: { en: "Warm-intro map from LinkedIn base", fr: "Carte des intros chaleureuses depuis LinkedIn" }, detail: { en: "Cross the 4,767-contact scored export against every P1/P2 target; pick best introducer per target.", fr: "Croiser l'export noté de 4 767 contacts avec chaque cible P1/P2; choisir le meilleur intermédiaire par cible." }, suggestedOwner: "François" },
          { id: "m2t3", title: { en: "Round structure decided", fr: "Structure de la ronde décidée" }, detail: { en: "$300–400K lead + $250–350K angels + institutional co-invest. Confirm instrument and floor/cap.", fr: "300–400 K$ chef de file + 250–350 K$ anges + co-investissement institutionnel. Confirmer l'instrument et le plancher/plafond." }, suggestedOwner: "François" },
          { id: "m2t4", title: { en: "Pitch rehearsed + 40-question Q&A bank", fr: "Pitch répété + banque de 40 questions-réponses" }, detail: { en: "Two dry-run pitches with friendly investors; log every objection and the agreed answer.", fr: "Deux pitchs à blanc avec des investisseurs amicaux; consigner chaque objection et la réponse retenue." }, suggestedOwner: "Open" },
        ],
      },
      {
        id: "m3",
        code: "M3",
        title: { en: "INSTINCT package v1 shipped", fr: "Dossier INSTINCT v1 livré" },
        goal: {
          en: "A producer-grade package: bible, trailer, budget top-sheet, sizzle. Ready to leave behind after every producer meeting.",
          fr: "Un dossier de calibre producteur : bible, bande-annonce, sommaire budgétaire, sizzle. Prêt à laisser après chaque rencontre producteur.",
        },
        window: { en: "Jul 15–26", fr: "15–26 juil." },
        track: "INSTINCT",
        tasks: [
          { id: "m3t1", title: { en: "Series bible refresh", fr: "Mise à jour de la bible de série" }, detail: { en: "32 athletes · 5 disciplines + PürInstinct main game · 12 episodes · elimination arc. ANW + All-Round Champion comparables page.", fr: "32 athlètes · 5 disciplines + jeu principal PürInstinct · 12 épisodes · arc à élimination. Page comparables ANW + All-Round Champion." }, suggestedOwner: "Dominique" },
          { id: "m3t2", title: { en: "40-second VO trailer final", fr: "Bande-annonce finale 40 secondes avec voix hors champ" }, detail: { en: "ElevenLabs VO + CapCut edit locked from existing script.", fr: "Voix ElevenLabs + montage CapCut verrouillé à partir du script existant." }, suggestedOwner: "Dominique" },
          { id: "m3t3", title: { en: "Budget top-sheet + financing structure", fr: "Sommaire budgétaire + structure de financement" }, detail: { en: "Per-episode cost, FMC / licence-fee / format-royalty structure for Québec + English Canada.", fr: "Coût par épisode, structure FMC / frais de licence / redevance de format pour le Québec + Canada anglais." }, suggestedOwner: "François" },
          { id: "m3t4", title: { en: "Sizzle cut from existing footage + Kling assets", fr: "Sizzle monté à partir des images existantes + actifs Kling" }, detail: { en: "90 seconds, INSTINCT tone. Placeholder for showcase footage upgrade in Phase 3.", fr: "90 secondes, ton INSTINCT. Placeholder en attendant les images de l'événement showcase en Phase 3." }, suggestedOwner: "Dominique" },
        ],
      },
    ],
  },
  {
    id: "p2",
    name: { en: "Phase 2 — Market Contact", fr: "Phase 2 — Contact marché" },
    dates: { en: "Weeks 3–5 · Jul 27–Aug 16", fr: "Semaines 3–5 · 27 juil.–16 août" },
    intent: {
      en: "Warm doors first. Investors, partners and producers all engaged in the same three weeks so momentum in one track feeds the others.",
      fr: "Les portes chaleureuses d'abord. Investisseurs, partenaires et producteurs engagés dans les mêmes trois semaines pour que l'élan d'un axe nourrisse les autres.",
    },
    milestones: [
      {
        id: "m4",
        code: "M4",
        title: { en: "Investor wave 1 — warm paths", fr: "Vague investisseurs 1 — chemins chaleureux" },
        goal: {
          en: "15 first meetings held. Triptyq partner meeting + Anges Québec process formally started.",
          fr: "15 premières rencontres tenues. Rencontre avec un associé de Triptyq + processus Anges Québec officiellement lancé.",
        },
        window: { en: "Jul 27–Aug 16", fr: "27 juil.–16 août" },
        track: "Raise",
        tasks: [
          { id: "m4t1", title: { en: "Triptyq Capital — partner meeting via Bertrand Nepveu", fr: "Triptyq Capital — rencontre associé via Bertrand Nepveu" }, detail: { en: "Ask Bertrand for the formal introduction; target full-partnership pitch by Aug 7.", fr: "Demander à Bertrand l'introduction officielle; viser un pitch devant les associés d'ici le 7 août." }, suggestedOwner: "François" },
          { id: "m4t2", title: { en: "Anges Québec — official application + selection call", fr: "Anges Québec — candidature officielle + appel de sélection" }, detail: { en: "Submit on angesquebec.com; follow with Caroline Pelletier (VP sélection). Map member overlap.", fr: "Soumettre sur angesquebec.com; faire un suivi avec Caroline Pelletier (VP sélection). Cartographier les chevauchements de membres." }, suggestedOwner: "François" },
          { id: "m4t3", title: { en: "Mitch Garber — warm approach", fr: "Mitch Garber — approche chaleureuse" }, detail: { en: "Identify best mutual door (sports-business / philanthropy circles); send teaser + founder note.", fr: "Identifier la meilleure porte mutuelle (cercles sport-affaires / philanthropie); envoyer teaser + note des fondateurs." }, suggestedOwner: "François" },
          { id: "m4t4", title: { en: "Institutional groundwork — IQ / BDC", fr: "Travail de fond institutionnel — IQ / BDC" }, detail: { en: "Identify account directors; log program eligibility for post-lead co-investment.", fr: "Identifier les directeurs de comptes; consigner l'admissibilité aux programmes pour le co-investissement post-lead." }, suggestedOwner: "François" },
          { id: "m4t5", title: { en: "Weekly pipeline review ritual", fr: "Rituel hebdomadaire de revue du pipeline" }, detail: { en: "Monday war-room: statuses, blockers, next 5 meetings. Logged here in notes.", fr: "War-room du lundi : statuts, blocages, 5 prochaines rencontres. Consigné ici dans les notes." }, suggestedOwner: "Open" },
        ],
      },
      {
        id: "m5",
        code: "M5",
        title: { en: "Partner LOIs — de-risk Year 1 revenue", fr: "Lettres d'intention partenaires — dérisquer les revenus An 1" },
        goal: {
          en: "Signed paper that puts a floor under the Year-1 plan before the term-sheet conversation happens.",
          fr: "Des ententes signées qui établissent un plancher sous le plan de l'An 1 avant la conversation sur la term sheet.",
        },
        window: { en: "Jul 27–Aug 16", fr: "27 juil.–16 août" },
        track: "Partners",
        tasks: [
          { id: "m5t1", title: { en: "Moment Factory — JV term sheet advanced", fr: "Moment Factory — term sheet de coentreprise avancée" }, detail: { en: "Convert current discussions into a drafted term sheet; target signature before Day 60.", fr: "Convertir les discussions actuelles en une term sheet rédigée; viser une signature avant le jour 60." }, suggestedOwner: "Dominique" },
          { id: "m5t2", title: { en: "RSEQ presentation + 5 school-board LOIs", fr: "Présentation RSEQ + 5 lettres d'intention de commissions scolaires" }, detail: { en: "Formal federation meeting; LOIs for 2026–27 Commission-scolaire packages ($20K / 3 days).", fr: "Rencontre officielle avec la fédération; lettres d'intention pour les forfaits 2026-27 des commissions scolaires (20 K$ / 3 jours)." }, suggestedOwner: "Dominique" },
          { id: "m5t3", title: { en: "evenko — 2027 festival rental offer", fr: "evenko — offre de location festival 2027" }, detail: { en: "One-page cost-plus offer ($113.5K / 5 days, festival keeps ticketing) to Nick Farkas; invite to showcase.", fr: "Offre coût-plus d'une page (113,5 K$ / 5 jours, le festival garde la billetterie) à Nick Farkas; inviter à l'événement showcase." }, suggestedOwner: "François" },
          { id: "m5t4", title: { en: "Décathlon / Kipsta — merch conversation opened", fr: "Décathlon / Kipsta — conversation produits dérivés amorcée" }, detail: { en: "Co-branded signature ball + consumer field kit; school-channel angle.", fr: "Ballon signature co-marqué + trousse de terrain grand public; angle réseau scolaire." }, suggestedOwner: "François" },
          { id: "m5t5", title: { en: "Corporate Day pipeline — 3 GE prospects", fr: "Pipeline Journée corporative — 3 prospects grandes entreprises" }, detail: { en: "Three large-enterprise team-building prospects for fall 2026 ($40K product).", fr: "Trois prospects grande entreprise pour team-building à l'automne 2026 (produit à 40 K$)." }, suggestedOwner: "François" },
        ],
      },
      {
        id: "m6",
        code: "M6",
        title: { en: "Producer meetings — INSTINCT on the table", fr: "Rencontres producteurs — INSTINCT sur la table" },
        goal: {
          en: "Four producer meetings completed (2 Montréal, 2 Toronto). Broadcasters reached only through them.",
          fr: "Quatre rencontres producteurs complétées (2 Montréal, 2 Toronto). Diffuseurs joints seulement à travers eux.",
        },
        window: { en: "Aug 3–16", fr: "3–16 août" },
        track: "INSTINCT",
        tasks: [
          { id: "m6t1", title: { en: "Zone3 — pitch meeting (Montréal)", fr: "Zone3 — rencontre de pitch (Montréal)" }, detail: { en: "Brigitte Lemonde + VP développement non-fiction. Full package + showcase invitation.", fr: "Brigitte Lemonde + VP développement non-fiction. Dossier complet + invitation à l'événement showcase." }, suggestedOwner: "Dominique" },
          { id: "m6t2", title: { en: "Attraction — pitch meeting (Montréal)", fr: "Attraction — rencontre de pitch (Montréal)" }, detail: { en: "Competitive tension with Zone3; same package, one week later.", fr: "Tension compétitive avec Zone3; même dossier, une semaine plus tard." }, suggestedOwner: "Dominique" },
          { id: "m6t3", title: { en: "marblemedia — intro (Toronto)", fr: "marblemedia — introduction (Toronto)" }, detail: { en: "Mark Bishop / Matt Hornburg. Angle: the format that graduates the All-Round Champion audience.", fr: "Mark Bishop / Matt Hornburg. Angle : le format qui fait grandir l'auditoire d'All-Round Champion." }, suggestedOwner: "François" },
          { id: "m6t4", title: { en: "Insight Productions — intro (Toronto)", fr: "Insight Productions — introduction (Toronto)" }, detail: { en: "Door: Mark Lysakowski (Co-CCO, showrunner of the genre).", fr: "Porte : Mark Lysakowski (co-directeur créatif, showrunner du genre)." }, suggestedOwner: "François" },
          { id: "m6t5", title: { en: "Broadcaster map logged, no direct pitch", fr: "Carte des diffuseurs consignée, aucun pitch direct" }, detail: { en: "Noovo (Justin Stockman) · TVA · CBC (Sally Catto) · Radio-Canada — reached via whichever producer engages.", fr: "Noovo (Justin Stockman) · TVA · CBC (Sally Catto) · Radio-Canada — joints via le producteur qui s'engage." }, suggestedOwner: "Open" },
        ],
      },
    ],
  },
  {
    id: "p3",
    name: { en: "Phase 3 — Proof", fr: "Phase 3 — Preuve" },
    dates: { en: "Weeks 5–7 · Aug 17–30", fr: "Semaines 5–7 · 17–30 août" },
    intent: {
      en: "One event turns every assumption into footage: investors see demand, producers see television, partners see their logo on it.",
      fr: "Un événement transforme chaque hypothèse en images : les investisseurs voient la demande, les producteurs voient la télé, les partenaires voient leur logo dessus.",
    },
    milestones: [
      {
        id: "m7",
        code: "M7",
        title: { en: "Showcase event delivered", fr: "Événement showcase livré" },
        goal: {
          en: "One full PürInstinct Games day, professionally filmed, with investors, producers and partners in the stands.",
          fr: "Une journée complète PürInstinct Games, filmée professionnellement, avec investisseurs, producteurs et partenaires dans les estrades.",
        },
        window: { en: "Aug 17–30 (event ~Aug 22–24)", fr: "17–30 août (événement ~22–24 août)" },
        track: "Games",
        tasks: [
          { id: "m7t1", title: { en: "Host + venue locked", fr: "Hôte + lieu verrouillés" }, detail: { en: "School or corporate host; municipal or partner venue. Confirm insurance + first responder.", fr: "Hôte scolaire ou corporatif; lieu municipal ou partenaire. Confirmer assurances + premiers répondants." }, suggestedOwner: "Dominique" },
          { id: "m7t2", title: { en: "Guest list — investors, producers, partners", fr: "Liste d'invités — investisseurs, producteurs, partenaires" }, detail: { en: "Every open P1/P2 conversation gets a personal invitation.", fr: "Chaque conversation P1/P2 ouverte reçoit une invitation personnelle." }, suggestedOwner: "François" },
          { id: "m7t3", title: { en: "Production plan — film for two audiences", fr: "Plan de production — filmer pour deux auditoires" }, detail: { en: "Event-energy cut for sponsors/investors + INSTINCT-tone cut for producers. Videographer contracted.", fr: "Montage énergie-événement pour commanditaires/investisseurs + montage ton INSTINCT pour producteurs. Vidéaste sous contrat." }, suggestedOwner: "Dominique" },
          { id: "m7t4", title: { en: "Séan Garnier appearance locked", fr: "Présence de Séan Garnier confirmée" }, detail: { en: "Creator 01 on site; 3 co-created clips scheduled.", fr: "Créateur 01 sur place; 3 clips co-créés planifiés." }, suggestedOwner: "Dominique" },
          { id: "m7t5", title: { en: "Run-of-show + ops staffing", fr: "Conducteur d'événement + personnel opérations" }, detail: { en: "9–24 staff per model assumptions; setup/strike plan; Patrick Fortaich briefed.", fr: "9 à 24 employés selon les hypothèses du modèle; plan de montage/démontage; Patrick Fortaich briefé." }, suggestedOwner: "Open" },
        ],
      },
      {
        id: "m8",
        code: "M8",
        title: { en: "Content engine live", fr: "Moteur de contenu actif" },
        goal: {
          en: "The showcase becomes a permanent asset: three sizzle cuts and a social wave within 7 days of the event.",
          fr: "L'événement showcase devient un actif permanent : trois montages sizzle et une vague sociale dans les 7 jours suivant l'événement.",
        },
        window: { en: "Aug 24–30", fr: "24–30 août" },
        track: "Games",
        tasks: [
          { id: "m8t1", title: { en: "Sizzle cut 1 — event energy (sponsors/investors)", fr: "Sizzle 1 — énergie de l'événement (commanditaires/investisseurs)" }, suggestedOwner: "Dominique" },
          { id: "m8t2", title: { en: "Sizzle cut 2 — sport close-up (rules, five skills)", fr: "Sizzle 2 — gros plan sur le sport (règles, cinq habiletés)" }, suggestedOwner: "Dominique" },
          { id: "m8t3", title: { en: "Sizzle cut 3 — INSTINCT tone (replaces Kling placeholders)", fr: "Sizzle 3 — ton INSTINCT (remplace les placeholders Kling)" }, suggestedOwner: "Dominique" },
          { id: "m8t4", title: { en: "Social wave w/ Séan Garnier clips", fr: "Vague sociale avec les clips de Séan Garnier" }, detail: { en: "Coordinated posts; tag partners present at the event.", fr: "Publications coordonnées; identifier les partenaires présents à l'événement." }, suggestedOwner: "Open" },
        ],
      },
      {
        id: "m9",
        code: "M9",
        title: { en: "Diligence room live", fr: "Salle de diligence active" },
        goal: {
          en: "When the term sheet lands, DD takes days, not weeks.",
          fr: "Quand la term sheet arrive, la diligence raisonnable prend des jours, pas des semaines.",
        },
        window: { en: "Aug 17–30", fr: "17–30 août" },
        track: "Raise",
        tasks: [
          { id: "m9t1", title: { en: "Monthly cash model (18 months)", fr: "Modèle de trésorerie mensuel (18 mois)" }, detail: { en: "Use-of-funds burn by month against the $750K.", fr: "Consommation des fonds par mois par rapport aux 750 K$." }, suggestedOwner: "François" },
          { id: "m9t2", title: { en: "IP & trademark file complete", fr: "Dossier PI & marque de commerce complet" }, detail: { en: "Registered sport + brand marks, JV IP terms with Moment Factory drafted.", fr: "Marques de sport et de marque enregistrées, conditions de PI de la coentreprise avec Moment Factory rédigées." }, suggestedOwner: "François" },
          { id: "m9t3", title: { en: "Corporate records + insurance certificates", fr: "Registres corporatifs + certificats d'assurance" }, suggestedOwner: "François" },
          { id: "m9t4", title: { en: "LOIs and pipeline evidence filed", fr: "Lettres d'intention et preuves de pipeline classées" }, detail: { en: "Everything signed in M5 goes in the dataroom same week.", fr: "Tout ce qui est signé en M5 entre dans la dataroom la même semaine." }, suggestedOwner: "Open" },
        ],
      },
    ],
  },
  {
    id: "p4",
    name: { en: "Phase 4 — Close", fr: "Phase 4 — Clôture" },
    dates: { en: "Weeks 7–9 · Aug 31–Sep 13", fr: "Semaines 7–9 · 31 août–13 sept." },
    intent: {
      en: "Convert. Term sheet to close on the raise, producer interest to a signed development path, and the Year-1 calendar locked.",
      fr: "Convertir. La term sheet mène à la clôture de la ronde, l'intérêt des producteurs à une entente de développement signée, et le calendrier de l'An 1 verrouillé.",
    },
    milestones: [
      {
        id: "m10",
        code: "M10",
        title: { en: "Term sheet & round close", fr: "Term sheet & clôture de la ronde" },
        goal: {
          en: "$750K circled or closed by Day 60.",
          fr: "750 K$ engagés ou clôturés d'ici le jour 60.",
        },
        window: { en: "Aug 31–Sep 13", fr: "31 août–13 sept." },
        track: "Raise",
        tasks: [
          { id: "m10t1", title: { en: "Lead term sheet negotiated", fr: "Term sheet du chef de file négociée" }, detail: { en: "Valuation, board/observer seat, information rights. Counsel reviews before signature.", fr: "Valorisation, siège au conseil/observateur, droits à l'information. Révision par l'avocat avant signature." }, suggestedOwner: "François" },
          { id: "m10t2", title: { en: "Angel syndicate filled to target", fr: "Syndicat d'anges rempli à la cible" }, detail: { en: "Anges Québec members + strategic angels complete the round alongside the lead.", fr: "Membres Anges Québec + anges stratégiques complètent la ronde aux côtés du chef de file." }, suggestedOwner: "François" },
          { id: "m10t3", title: { en: "Institutional co-invest confirmed", fr: "Co-investissement institutionnel confirmé" }, detail: { en: "IQ / AQC follow-on activated by the lead's commitment.", fr: "Suivi IQ / AQC activé par l'engagement du chef de file." }, suggestedOwner: "François" },
          { id: "m10t4", title: { en: "Legal close checklist executed", fr: "Liste de vérification légale de clôture exécutée" }, suggestedOwner: "François" },
        ],
      },
      {
        id: "m11",
        code: "M11",
        title: { en: "INSTINCT — development path signed", fr: "INSTINCT — entente de développement signée" },
        goal: {
          en: "One producer option or co-development agreement in negotiation; broadcaster introduced by that producer.",
          fr: "Une option de producteur ou entente de co-développement en négociation; diffuseur introduit par ce producteur.",
        },
        window: { en: "Aug 31–Sep 13", fr: "31 août–13 sept." },
        track: "INSTINCT",
        tasks: [
          { id: "m11t1", title: { en: "Producer shortlist decision", fr: "Décision sur la liste courte de producteurs" }, detail: { en: "Pick the lead producer based on offer + broadcaster access; keep one competitor warm.", fr: "Choisir le producteur principal selon l'offre + l'accès aux diffuseurs; garder un concurrent au chaud." }, suggestedOwner: "Dominique" },
          { id: "m11t2", title: { en: "Option / co-dev agreement negotiated", fr: "Entente d'option / co-développement négociée" }, detail: { en: "Protect format IP + PürInstinct brand integration; licence-fee floors per financial model.", fr: "Protéger la PI du format + l'intégration de la marque PürInstinct; planchers de frais de licence selon le modèle financier." }, suggestedOwner: "François" },
          { id: "m11t3", title: { en: "Broadcaster introduction via producer", fr: "Introduction aux diffuseurs via le producteur" }, detail: { en: "Noovo / TVA / CBC — producer leads, founders support with showcase footage.", fr: "Noovo / TVA / CBC — le producteur mène, les fondateurs appuient avec les images de l'événement showcase." }, suggestedOwner: "Dominique" },
        ],
      },
      {
        id: "m12",
        code: "M12",
        title: { en: "Launch runway locked", fr: "Piste de lancement verrouillée" },
        goal: {
          en: "Year 1 starts the day the round closes — not a quarter later.",
          fr: "L'An 1 commence le jour de la clôture de la ronde — pas un trimestre plus tard.",
        },
        window: { en: "Sep 1–13", fr: "1–13 sept." },
        track: "Games",
        tasks: [
          { id: "m12t1", title: { en: "Year-1 event calendar contracted", fr: "Calendrier d'événements An 1 sous contrat" }, detail: { en: "2 flagship Games + school-board packages + corporate days from M5 pipeline, dated and signed.", fr: "2 Games phares + forfaits commissions scolaires + journées corporatives du pipeline M5, datés et signés." }, suggestedOwner: "Dominique" },
          { id: "m12t2", title: { en: "Kit production order ready", fr: "Commande de production des trousses prête" }, detail: { en: "FieldTurf + Proludik quotes final; negotiate supplier-sponsor terms; order triggers at close.", fr: "Soumissions FieldTurf + Proludik finalisées; négocier les conditions fournisseur-commanditaire; commande déclenchée à la clôture." }, suggestedOwner: "Dominique" },
          { id: "m12t3", title: { en: "First ops hire scoped", fr: "Premier poste opérations défini" }, detail: { en: "Role, comp, start date per Year-1 team budget ($388K).", fr: "Rôle, rémunération, date de début selon le budget d'équipe An 1 (388 K$)." }, suggestedOwner: "François" },
          { id: "m12t4", title: { en: "Round announcement + PR plan", fr: "Annonce de la ronde + plan RP" }, detail: { en: "Press release, partner quotes (Moment Factory, lead investor), social plan.", fr: "Communiqué de presse, citations de partenaires (Moment Factory, investisseur chef de file), plan social." }, suggestedOwner: "Open" },
        ],
      },
    ],
  },
];

export const checkpoints: Checkpoint[] = [
  {
    id: "c1", code: "C1", day: { en: "Day 15 · Jul 27", fr: "Jour 15 · 27 juil." }, afterPhase: "p1",
    criteria: [
      { id: "c1-0", text: { en: "Dataroom complete and access-tracked", fr: "Dataroom complète et accès suivi" } },
      { id: "c1-1", text: { en: "Pitch tested on 2 friendly investors", fr: "Pitch testé auprès de 2 investisseurs amicaux" } },
      { id: "c1-2", text: { en: "INSTINCT package shipped to first producer", fr: "Dossier INSTINCT livré au premier producteur" } },
    ],
  },
  {
    id: "c2", code: "C2", day: { en: "Day 30 · Aug 11", fr: "Jour 30 · 11 août" }, afterPhase: "p2",
    criteria: [
      { id: "c2-0", text: { en: "≥ 12 investor first-meetings held", fr: "≥ 12 premières rencontres investisseurs tenues" } },
      { id: "c2-1", text: { en: "≥ 2 school-board LOIs signed", fr: "≥ 2 lettres d'intention de commissions scolaires signées" } },
      { id: "c2-2", text: { en: "≥ 2 producer meetings completed", fr: "≥ 2 rencontres producteurs complétées" } },
    ],
  },
  {
    id: "c3", code: "C3", day: { en: "Day 45 · Aug 26", fr: "Jour 45 · 26 août" }, afterPhase: "p3",
    criteria: [
      { id: "c3-0", text: { en: "Lead term sheet in negotiation OR ≥ $250K soft-circled", fr: "Term sheet du chef de file en négociation OU ≥ 250 K$ engagés informellement" } },
      { id: "c3-1", text: { en: "Showcase event delivered and filmed", fr: "Événement showcase livré et filmé" } },
      { id: "c3-2", text: { en: "evenko + RSEQ conversations at decision stage", fr: "Conversations evenko + RSEQ à l'étape décisionnelle" } },
    ],
  },
  {
    id: "c4", code: "C4", day: { en: "Day 60 · Sep 13", fr: "Jour 60 · 13 sept." }, afterPhase: "p4",
    criteria: [
      { id: "c4-0", text: { en: "$750K circled or closed", fr: "750 K$ engagés ou clôturés" } },
      { id: "c4-1", text: { en: "1 producer agreement in negotiation", fr: "1 entente de producteur en négociation" } },
      { id: "c4-2", text: { en: "≥ 4 Year-1 events contracted", fr: "≥ 4 événements An 1 sous contrat" } },
    ],
  },
];

export const allMilestones: Milestone[] = phases.flatMap((p) => p.milestones);

export function milestoneById(id: string): Milestone | undefined {
  return allMilestones.find((m) => m.id === id);
}

export function taskById(id: string): Task | undefined {
  return allMilestones.flatMap((m) => m.tasks).find((t) => t.id === id);
}

export const trackColors: Record<Milestone["track"], string> = {
  Raise: "#CCFF00",
  Games: "#7DF9FF",
  INSTINCT: "#FF7A59",
  Partners: "#C99CFF",
};

export const trackLabels: Record<Milestone["track"], Localized> = {
  Raise: { en: "Raise", fr: "Levée" },
  Games: { en: "Games", fr: "Jeux" },
  INSTINCT: { en: "INSTINCT", fr: "INSTINCT" },
  Partners: { en: "Partners", fr: "Partenaires" },
};
