import { LAYERS, ViewAction, ViewRequest, ViewState, initialViewState, parseView, requestedIndicator, serializeView, viewReducer } from './viewState';

const [CONSO, ARTIF_STOCK, ARTIF_FLUX] = LAYERS;

const DEFAULT_VIEW: ViewRequest = { zone: 'FRANCE', scale: 'EPCI', startYear: 2011, endYear: 2024, indicatorId: 'conso_pct_surface' };

// État obtenu en ouvrant la page sur une adresse puis en enchaînant des actions
const stateAfter = (search: string, ...actions: ViewAction[]): ViewState => actions.reduce(viewReducer, initialViewState(search));

describe('parseView', () => {
    it("[URL] ouvre la France entière par EPCI, de 2011 à 2024, sur la consommation en pourcentage de la surface quand l'adresse est nue", () => {
        expect(parseView('')).toEqual(DEFAULT_VIEW);
    });

    it("[URL] reprend la vue décrite par l'adresse", () => {
        expect(parseView('?zone=REGION_53&scale=EPCI&start=2015&end=2020&indicator=artif_desartif_ha')).toEqual({
            zone: 'REGION_53',
            scale: 'EPCI',
            startYear: 2015,
            endYear: 2020,
            indicatorId: 'artif_desartif_ha',
        });
    });

    it.each(['XX', 'COMM_35238', 'REGION_', 'REGION'])('[URL] remplace la zone invalide « %s » par la France entière', (zone) => {
        expect(parseView(`?zone=${zone}`).zone).toBe('FRANCE');
    });

    it("[URL] garde une zone bien formée même si le territoire n'existe pas", () => {
        expect(parseView('?zone=EPCI_inconnu')).toMatchObject({ zone: 'EPCI_inconnu', scale: 'COMM' });
    });

    it.each([
        ['zone=FRANCE&scale=SCOT', 'EPCI'],
        ['zone=HEXAGONE&scale=NATION', 'EPCI'],
        ['zone=HEXAGONE', 'EPCI'],
        ['zone=DEPART_35&scale=REGION', 'EPCI'],
        ['zone=EPCI_243500139&scale=EPCI', 'COMM'],
        ['zone=REGION_53', 'DEPART'],
    ])("[URL] remplace une maille absente ou non proposée par la maille d'ouverture de la zone (%s)", (search, scale) => {
        expect(parseView(`?${search}`).scale).toBe(scale);
    });

    it.each(['REGION', 'DEPART', 'EPCI', 'COMM'])("[URL] garde la maille « %s » demandée pour la France entière", (scale) => {
        expect(parseView(`?scale=${scale}`)).toMatchObject({ zone: 'FRANCE', scale });
    });

    it("[URL] garde la maille commune demandée pour l'Hexagone", () => {
        expect(parseView('?zone=HEXAGONE&scale=COMM')).toMatchObject({ zone: 'HEXAGONE', scale: 'COMM' });
    });

    it.each(['abc', '2011.5', '1900', '-2015', ''])("[URL] remplace l'année « %s » par 2011 au début et 2024 à la fin", (year) => {
        expect(parseView(`?start=${year}`).startYear).toBe(2011);
        expect(parseView(`?end=${year}`).endYear).toBe(2024);
    });

    it('[URL] accepte toute année entière à partir de 1901, sans connaître les années disponibles', () => {
        expect(parseView('?start=1901&end=2090')).toMatchObject({ startYear: 1901, endYear: 2090 });
    });

    it('[URL] ramène une fin antérieure au début sur le début', () => {
        expect(parseView('?start=2018&end=2012')).toMatchObject({ startYear: 2018, endYear: 2018 });
    });

    it.each(['inconnu', 'conso_by_year_and_destination', 'destination_share'])(
        "[URL] remplace l'indicateur « %s », inconnu ou réservé à un graphique, par la première carte du menu",
        (indicator) => {
            expect(parseView(`?indicator=${indicator}`).indicatorId).toBe('conso_pct_surface');
        },
    );

    it("[URL] garde la carte en hectares quand l'adresse la demande", () => {
        expect(parseView('?indicator=conso_ha').indicatorId).toBe('conso_ha');
    });

    // Cartes à années fixes retirées du catalogue : leurs adresses n'ont pas d'alias
    it.each(['annual_conso_2011_2021', 'annual_conso_2021_end', 'conso_2011_end', 'conso_2011_2021', 'conso_2021_end'])(
        "[URL] ouvre la première carte du menu, sur la période de l'adresse, pour la carte retirée « %s »",
        (indicator) => {
            expect(parseView(`?zone=REGION_53&scale=EPCI&start=2015&end=2020&indicator=${indicator}`)).toEqual({
                zone: 'REGION_53',
                scale: 'EPCI',
                startYear: 2015,
                endYear: 2020,
                indicatorId: 'conso_pct_surface',
            });
        },
    );

    it.each(['habitat', 'activite', 'mixte', 'route', 'ferroviaire', 'inconnu'])("[URL] garde la carte carroyée de la destination « %s » quand l'adresse la demande", (destination) => {
        const view = parseView(`?zone=REGION_53&scale=EPCI&start=2015&end=2020&indicator=conso_${destination}_ha_gridded`);

        expect(view.indicatorId).toBe(`conso_${destination}_ha_gridded`);
        expect(parseView(serializeView('', view))).toEqual(view);
    });
});

describe('requestedIndicator', () => {
    it('rend la carte demandée telle que le catalogue la déclare, pour la consommation comme pour l’OCS GE', () => {
        expect(requestedIndicator({ ...DEFAULT_VIEW, indicatorId: 'conso_evolution_between_periods' })).toMatchObject({
            id: 'conso_evolution_between_periods',
            unit: '%',
            label: expect.stringContaining('{{end}}'),
        });
        expect(requestedIndicator({ ...DEFAULT_VIEW, indicatorId: 'artif_desartif_ha' })).toMatchObject({ id: 'artif_desartif_ha', source: 'ocsge' });
    });

    it('rend la première carte du menu pour un identifiant inconnu ou réservé à un graphique', () => {
        expect(requestedIndicator({ ...DEFAULT_VIEW, indicatorId: 'destination_share' }).id).toBe('conso_pct_surface');
        expect(requestedIndicator({ ...DEFAULT_VIEW, indicatorId: 'inconnu' }).id).toBe('conso_pct_surface');
    });
});

describe('serializeView', () => {
    it('[URL] écrit la zone, la maille, la période et la carte', () => {
        expect(serializeView('', DEFAULT_VIEW)).toBe('?zone=FRANCE&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface');
    });

    it('[URL] conserve les paramètres qui ne décrivent pas la vue et remplace les autres', () => {
        expect(serializeView('?showinfo&zone=HEXAGONE&utm_source=lettre', { ...DEFAULT_VIEW, zone: 'REGION_53', scale: 'DEPART' })).toBe(
            '?showinfo=&zone=REGION_53&utm_source=lettre&scale=DEPART&start=2011&end=2024&indicator=conso_pct_surface',
        );
    });

    it("[URL] donne une adresse qui rouvre la même vue", () => {
        const request: ViewRequest = { zone: 'DEPART_35', scale: 'COMM', startYear: 2013, endYear: 2019, indicatorId: 'artif_pct' };

        expect(parseView(serializeView('?showinfo', request))).toEqual(request);
    });
});

describe('initialViewState', () => {
    it('[URL] déplie la rubrique de la consommation, coche tous les graphiques et ne connaît encore aucun nom', () => {
        expect(initialViewState('')).toEqual({
            request: DEFAULT_VIEW,
            openRubrique: CONSO,
            lastIndicatorByRubrique: { [CONSO]: 'conso_pct_surface' },
            lastIndicatorByLine: {},
            activeCharts: [
                'crossed_rates_scatter',
                'conso_by_year_and_destination',
                'conso_habitat_by_year',
                'conso_activite_by_year',
                'conso_by_year',
                'destination_share',
                'conso_and_population_by_year',
                'conso_and_households_by_year',
                'employment_by_census',
                'artif_share_by_millesime',
                'artif_by_cover',
                'artif_and_desartif',
                'artif_flux_by_cover',
            ],
            names: {},
        });
    });

    it.each([
        ['artif_pct', ARTIF_STOCK],
        ['artif_desartif_ha', ARTIF_FLUX],
    ])("[URL] déplie la rubrique de l'indicateur d'artificialisation « %s »", (indicator, rubrique) => {
        expect(initialViewState(`?indicator=${indicator}`)).toMatchObject({ openRubrique: rubrique, lastIndicatorByRubrique: { [rubrique]: indicator } });
    });

    it('[URL] retient, pour la ligne du carroyage, la destination que l’adresse demande', () => {
        expect(initialViewState('?indicator=conso_route_ha_gridded').lastIndicatorByLine).toEqual({ conso_ha_gridded: 'conso_route_ha_gridded' });
        expect(initialViewState('?indicator=conso_ha_gridded').lastIndicatorByLine).toEqual({ conso_ha_gridded: 'conso_ha_gridded' });
    });
});

describe('viewReducer', () => {
    it.each([
        ['?zone=FRANCE&scale=DEPART', 'REGION_53', 'DEPART'],
        ['?zone=FRANCE&scale=EPCI', 'HEXAGONE', 'EPCI'],
        ['?zone=REGION_53&scale=COMM', 'DEPART_35', 'COMM'],
        // La maille commune vaut pour toutes les zones : elle suit jusqu'à la France entière et retour
        ['?zone=REGION_53&scale=COMM', 'FRANCE', 'COMM'],
        ['?zone=EPCI_243500139&scale=COMM', 'HEXAGONE', 'COMM'],
        ['?zone=FRANCE&scale=COMM', 'HEXAGONE', 'COMM'],
        ['?zone=FRANCE&scale=COMM', 'DEPART_35', 'COMM'],
    ])('[Zones] garde la maille quand la nouvelle zone la propose encore (%s vers %s)', (search, zone, scale) => {
        expect(stateAfter(search, { type: 'zoneChanged', zone }).request).toMatchObject({ zone, scale });
    });

    it.each([
        ['?zone=FRANCE&scale=REGION', 'REGION_53', 'DEPART'],
        ['?zone=REGION_53&scale=DEPART', 'DEPART_35', 'EPCI'],
        ['?zone=DEPART_35&scale=EPCI', 'EPCI_243500139', 'COMM'],
    ])("[Zones] prend la maille d'ouverture de la nouvelle zone quand elle ne propose plus la maille en cours (%s vers %s)", (search, zone, scale) => {
        expect(stateAfter(search, { type: 'zoneChanged', zone }).request).toMatchObject({ zone, scale });
    });

    describe('carte des sols artificialisés : ses territoires ne servent qu’à ouvrir une zone', () => {
        const SOILS = 'artif_soils';

        it('s’ouvre par région sur le pays quand l’adresse ne dit pas la maille', () => {
            expect(parseView(`?indicator=${SOILS}`)).toMatchObject({ zone: 'FRANCE', scale: 'REGION' });
            expect(parseView(`?zone=HEXAGONE&indicator=${SOILS}`)).toMatchObject({ scale: 'REGION' });
            expect(parseView(`?zone=REGION_84&indicator=${SOILS}`)).toMatchObject({ scale: 'EPCI' });
            // Les autres cartes gardent la maille d'ouverture de la zone
            expect(parseView('?indicator=artif_pct')).toMatchObject({ scale: 'EPCI' });
            expect(parseView('?zone=REGION_84&indicator=artif_pct')).toMatchObject({ scale: 'DEPART' });
        });

        it('respecte la maille de l’adresse', () => {
            expect(parseView(`?scale=DEPART&indicator=${SOILS}`)).toMatchObject({ scale: 'DEPART' });
        });

        it('passe à la maille région en arrivant sur la carte depuis le pays par EPCI', () => {
            const state = stateAfter('?scale=EPCI&indicator=conso_pct_surface', { type: 'indicatorSelected', id: SOILS });

            expect(state.request).toMatchObject({ zone: 'FRANCE', scale: 'REGION', indicatorId: SOILS });
        });

        it('ouvre une région par EPCI, et non par département ni par commune', () => {
            const opened = stateAfter(`?indicator=${SOILS}`, { type: 'zoneChanged', zone: 'REGION_84', name: 'Auvergne-Rhône-Alpes' });

            expect(opened.request).toMatchObject({ zone: 'REGION_84', scale: 'EPCI' });
        });

        it('ouvre ensuite un EPCI par commune, sa seule maille', () => {
            const opened = stateAfter(`?zone=REGION_84&indicator=${SOILS}`, { type: 'zoneChanged', zone: 'EPCI_200046977' });

            expect(opened.request).toMatchObject({ zone: 'EPCI_200046977', scale: 'COMM' });
        });

        it('revient au pays par région, quelle que soit la maille quittée', () => {
            const back = stateAfter(`?zone=REGION_84&scale=COMM&indicator=${SOILS}`, { type: 'zoneChanged', zone: 'FRANCE' });

            expect(back.request).toMatchObject({ zone: 'FRANCE', scale: 'REGION' });
        });

        it('garde la maille en cours pour un département, auquel la carte n’impose rien', () => {
            const opened = stateAfter(`?zone=REGION_84&scale=EPCI&indicator=${SOILS}`, { type: 'zoneChanged', zone: 'DEPART_69' });

            expect(opened.request).toMatchObject({ zone: 'DEPART_69', scale: 'EPCI' });
        });

        it('ne change rien aux autres cartes : la maille en cours suit l’utilisateur d’une zone à l’autre', () => {
            const opened = stateAfter('?scale=DEPART&indicator=artif_pct', { type: 'zoneChanged', zone: 'REGION_84' });

            expect(opened.request).toMatchObject({ zone: 'REGION_84', scale: 'DEPART' });
        });
    });

    it('[Zones] retient le nom du territoire cliqué, sans toucher à la période ni à la carte', () => {
        const state = stateAfter('?start=2015&end=2020&indicator=conso_ha', { type: 'zoneChanged', zone: 'DEPART_35', name: 'Ille-et-Vilaine' });

        expect(state.names).toEqual({ DEPART_35: 'Ille-et-Vilaine' });
        expect(state.request).toEqual({ zone: 'DEPART_35', scale: 'EPCI', startYear: 2015, endYear: 2020, indicatorId: 'conso_ha' });
    });

    it('[Zones] complète les noms connus par ceux des territoires chargés', () => {
        const state = stateAfter(
            '',
            { type: 'namesLearned', names: { DEPART_35: 'Ille-et-Vilaine' } },
            { type: 'namesLearned', names: { REGION_53: 'Bretagne', EPCI_243500139: 'Rennes Métropole' } },
        );

        expect(state.names).toEqual({ DEPART_35: 'Ille-et-Vilaine', REGION_53: 'Bretagne', EPCI_243500139: 'Rennes Métropole' });
    });

    it('[Mailles] change la maille seule', () => {
        expect(stateAfter('?zone=REGION_53', { type: 'scaleChanged', scale: 'COMM' }).request).toEqual({ ...DEFAULT_VIEW, zone: 'REGION_53', scale: 'COMM' });
    });

    it("change l'année de début ou l'année de fin seule", () => {
        const state = stateAfter('', { type: 'startYearChanged', year: 2014 }, { type: 'endYearChanged', year: 2019 });

        expect(state.request).toEqual({ ...DEFAULT_VIEW, startYear: 2014, endYear: 2019 });
    });

    it('change les deux années d’une période en une seule demande, sans toucher au reste de la vue', () => {
        const before = initialViewState('?zone=REGION_53&scale=EPCI&start=2015&end=2022&indicator=conso_ha');
        const after = viewReducer(before, { type: 'periodChanged', startYear: 2011, endYear: 2020 });

        expect(after.request).toEqual({ ...before.request, startYear: 2011, endYear: 2020 });
        expect({ ...after, request: before.request }).toEqual(before);
    });

    it('resserre la période sur les années disponibles : le début par le bas, la fin par le haut', () => {
        expect(stateAfter('?start=2005&end=2030', { type: 'periodClamped', years: { min: 2009, max: 2023 } }).request).toMatchObject({
            startYear: 2009,
            endYear: 2023,
        });
    });

    it('ne resserre rien d’autre : un début postérieur à la dernière année disponible reste en place', () => {
        expect(stateAfter('?start=2026&end=2030', { type: 'periodClamped', years: { min: 2009, max: 2023 } }).request).toMatchObject({
            startYear: 2026,
            endYear: 2023,
        });
    });

    it("[Rubriques] choisit une carte sans déplier ni replier de rubrique, et la retient pour sa rubrique", () => {
        const state = stateAfter('', { type: 'indicatorSelected', id: 'conso_ha' }, { type: 'indicatorSelected', id: 'artif_pct' });

        expect(state.request.indicatorId).toBe('artif_pct');
        expect(state.openRubrique).toBe(CONSO);
        expect(state.lastIndicatorByRubrique).toEqual({ [CONSO]: 'conso_ha', [ARTIF_STOCK]: 'artif_pct' });
    });

    it("[Rubriques] déplie une rubrique jamais ouverte sur sa première carte, et replie l'autre", () => {
        expect(stateAfter('', { type: 'rubriqueToggled', id: ARTIF_STOCK })).toMatchObject({ openRubrique: ARTIF_STOCK, request: { indicatorId: 'artif_soils' } });
        expect(stateAfter('', { type: 'rubriqueToggled', id: ARTIF_FLUX })).toMatchObject({
            openRubrique: ARTIF_FLUX,
            request: { indicatorId: 'artif_net_annual_pct_surface' },
        });
        expect(stateAfter('?indicator=artif_desartif_ha', { type: 'rubriqueToggled', id: CONSO })).toMatchObject({
            openRubrique: CONSO,
            request: { indicatorId: 'conso_pct_surface' },
        });
    });

    it('[Rubriques] rouvre une rubrique sur la dernière carte qui y a été choisie', () => {
        const state = stateAfter(
            '',
            { type: 'indicatorSelected', id: 'bivariate_habitat_menages' },
            { type: 'rubriqueToggled', id: ARTIF_FLUX },
            { type: 'indicatorSelected', id: 'artif_desartif_ha' },
            { type: 'rubriqueToggled', id: CONSO },
        );

        expect(state).toMatchObject({ openRubrique: CONSO, request: { indicatorId: 'bivariate_habitat_menages' } });
        expect(viewReducer(state, { type: 'rubriqueToggled', id: ARTIF_FLUX })).toMatchObject({ openRubrique: ARTIF_FLUX, request: { indicatorId: 'artif_desartif_ha' } });
    });

    it('[Rubriques] laisse la carte en place quand on replie sa rubrique, puis quand on la redéplie', () => {
        const closed = stateAfter('?indicator=conso_ha', { type: 'rubriqueToggled', id: CONSO });
        const reopened = viewReducer(closed, { type: 'rubriqueToggled', id: CONSO });

        expect(closed).toMatchObject({ openRubrique: null, request: { indicatorId: 'conso_ha' } });
        expect(reopened).toMatchObject({ openRubrique: CONSO, request: { indicatorId: 'conso_ha' } });
        expect(reopened.request).toBe(closed.request);
    });

    it('[Lignes] ouvre la ligne du carroyage sur toutes les destinations tant qu’aucune n’y a été choisie', () => {
        const state = stateAfter('', { type: 'lineSelected', id: 'conso_ha_gridded' });

        expect(state.request.indicatorId).toBe('conso_ha_gridded');
        expect(state.lastIndicatorByLine).toEqual({ conso_ha_gridded: 'conso_ha_gridded' });
    });

    it('[Lignes] retrouve, en revenant sur la ligne du carroyage, la dernière destination choisie', () => {
        const away = stateAfter(
            '',
            { type: 'lineSelected', id: 'conso_ha_gridded' },
            { type: 'indicatorSelected', id: 'conso_activite_ha_gridded' },
            { type: 'lineSelected', id: 'conso_ha' },
        );

        expect(away.request.indicatorId).toBe('conso_ha');
        expect(away.lastIndicatorByLine).toEqual({ conso_ha_gridded: 'conso_activite_ha_gridded' });
        expect(viewReducer(away, { type: 'lineSelected', id: 'conso_ha_gridded' }).request.indicatorId).toBe('conso_activite_ha_gridded');
    });

    it('[Lignes] revient à toutes les destinations quand leur bouton est choisi', () => {
        const state = stateAfter('?indicator=conso_route_ha_gridded', { type: 'indicatorSelected', id: 'conso_ha_gridded' }, { type: 'lineSelected', id: 'conso_pct_surface' });

        expect(viewReducer(state, { type: 'lineSelected', id: 'conso_ha_gridded' }).request.indicatorId).toBe('conso_ha_gridded');
    });

    it('[Lignes] retrouve la destination choisie après un passage par une autre rubrique', () => {
        const state = stateAfter('?indicator=conso_mixte_ha_gridded', { type: 'rubriqueToggled', id: ARTIF_STOCK }, { type: 'rubriqueToggled', id: CONSO });

        expect(state).toMatchObject({ openRubrique: CONSO, request: { indicatorId: 'conso_mixte_ha_gridded' } });
    });

    it('[Lignes] choisit la carte d’une ligne qui n’en porte qu’une, sans rien retenir pour elle', () => {
        const state = stateAfter('', { type: 'lineSelected', id: 'conso_ha' });

        expect(state.request.indicatorId).toBe('conso_ha');
        expect(state.lastIndicatorByLine).toEqual({});
        expect(state.lastIndicatorByRubrique).toEqual({ [CONSO]: 'conso_ha' });
    });

    it('décoche un graphique, puis le recoche à la suite des autres', () => {
        const others = initialViewState('').activeCharts.filter((id) => id !== 'conso_by_year_and_destination');
        const unchecked = stateAfter('', { type: 'chartToggled', id: 'conso_by_year_and_destination' });

        expect(unchecked.activeCharts).toEqual(others);
        expect(viewReducer(unchecked, { type: 'chartToggled', id: 'conso_by_year_and_destination' }).activeCharts).toEqual([
            ...others,
            'conso_by_year_and_destination',
        ]);
    });

    it.each<[string, ViewAction]>([
        ['la zone affichée', { type: 'zoneChanged', zone: 'REGION_53', name: 'Bretagne' }],
        ['la maille affichée', { type: 'scaleChanged', scale: 'DEPART' }],
        ["l'année de début en cours", { type: 'startYearChanged', year: 2012 }],
        ["l'année de fin en cours", { type: 'endYearChanged', year: 2020 }],
        ['la période en cours', { type: 'periodChanged', startYear: 2012, endYear: 2020 }],
        ['une période déjà dans les années disponibles', { type: 'periodClamped', years: { min: 2009, max: 2023 } }],
        ['la carte affichée', { type: 'indicatorSelected', id: 'conso_pct_surface' }],
        ['la ligne de la carte affichée', { type: 'lineSelected', id: 'conso_pct_surface' }],
        ['des noms déjà connus', { type: 'namesLearned', names: { REGION_53: 'Bretagne' } }],
    ])('rend le même état quand on redemande %s', (_, action) => {
        const state = stateAfter('?zone=REGION_53&scale=DEPART&start=2012&end=2020&indicator=conso_pct_surface', {
            type: 'namesLearned',
            names: { REGION_53: 'Bretagne' },
        });

        expect(viewReducer(state, action)).toBe(state);
    });

    it("ne change pas la demande, donc pas l'adresse, quand seuls le menu, les graphiques ou les noms changent", () => {
        const state = initialViewState('');

        expect(viewReducer(state, { type: 'rubriqueToggled', id: CONSO }).request).toBe(state.request);
        expect(viewReducer(state, { type: 'chartToggled', id: 'destination_share' }).request).toBe(state.request);
        expect(viewReducer(state, { type: 'namesLearned', names: { REGION_53: 'Bretagne' } }).request).toBe(state.request);
    });
});
