import React, { useState, useRef, useEffect, useMemo } from "react";
import Guide from "@components/ui/Guide";
import { FrichesChart } from "@components/charts/friches/FrichesChart";
import { useGetLandFrichesStatutQuery, useGetLandFrichesQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";
import { FrichesMap } from "@components/map/friches/FrichesMap";
import { STATUT_BADGE_CONFIG, STATUT_CONFIG, STATUT_ORDER } from "@components/map/friches/constants";
import { LandFriche } from "@services/types/land_friches";
import { useDataTable } from "@hooks/useDataTable";
import { DataTable } from "@components/ui/DataTable";
import { Pagination } from "@components/ui/Pagination";
import { SearchInput } from "@components/ui/SearchInput";
import { FricheStatusDetails, FricheStatusEnum, LandDetailResultType } from "@services/types/land";

interface FrichesProps {
    landData: LandDetailResultType;
}

const StatutCard = styled.div<{ $isHighlighted?: boolean }>`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    ${({ $isHighlighted }) => $isHighlighted && `
        border: 3px solid var(--artwork-major-blue-france);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        position: relative;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    `}
`;

const HighlightBadge = styled.div`
    position: absolute;
    top: -10px;
    right: 10px;
    background: var(--artwork-major-blue-france);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatutHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const StatutIcon = styled.i<{ $isHighlighted?: boolean }>`
    font-size: 2.5rem;
    ${({ $isHighlighted }) => $isHighlighted && `
        color: var(--artwork-major-blue-france);
    `}
`;

const StatutBadge = styled.span`
    font-size: 1rem;
    text-transform: lowercase;
`;

const StatutContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const StatutValue = styled.div<{ $isHighlighted?: boolean }>`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
	${({ $isHighlighted }) => $isHighlighted && `
	    color: var(--artwork-major-blue-france);
	`}
`;

const StatutLabel = styled.p`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0;
`;

const IconZoneActivite = styled.i`
    font-size: 1.5rem;
`;

const DisplayPaginationInfo = styled.div`
    margin-top: 0.8rem;
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: auto;
    color: var(--text-mention-grey);
`;

const SearchContainer = styled.div`
    max-width: 600px;
    margin-left: auto;
`;

const FRICHES_CHARTS = [
    { id: 'friche_pollution' },
    { id: 'friche_surface' },
    { id: 'friche_type' },
    { id: 'friche_zonage_environnemental' },
    { id: 'friche_zonage_type' },
    { id: 'friche_zone_activite' }
] as const;


const FrichesStatut: React.FC<{
    friche_count: number;
    friche_surface: number;
    friche_statut: string;
}> = ({ friche_count, friche_surface, friche_statut }) => {
    const { icon } = STATUT_CONFIG[friche_statut as keyof typeof STATUT_CONFIG] || { 
        icon: 'bi bi-circle'
    };
    
    const isHighlighted = friche_statut === 'friche sans projet';

    return (
        <StatutCard $isHighlighted={isHighlighted}>
            {isHighlighted && (
                <HighlightBadge>
                    <i className="bi bi-lightning-charge"></i> Actionnable
                </HighlightBadge>
            )}
            <StatutHeader>
                <StatutIcon className={icon} $isHighlighted={isHighlighted} />
                <StatutBadge className={`fr-badge fr-badge--no-icon ${STATUT_BADGE_CONFIG[friche_statut as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                    {friche_statut}
                </StatutBadge>
            </StatutHeader>
            <StatutContent>
                <StatutValue $isHighlighted={isHighlighted}>{friche_count}</StatutValue>
                <StatutLabel>Soit {formatNumber({ number: friche_surface })} ha</StatutLabel>
            </StatutContent>
        </StatutCard>
    );
};

const DetailsFricheZonageEnvironnemental: React.FC = () => (
	<div>
        <h6 className="fr-mb-1w">Informations complémentaires</h6>
		<p className="fr-text--xs"><strong>La zone naturelle d'intérêt écologique, faunistique et floristique (en abrégé ZNIEFF)</strong> est un espace naturel inventorié en raison de son caractère remarquable. Elle complète les zonages réglementaires (aires protégées) pour guider les décisions d'aménagement du territoire (documents d'urbanisme, créations d'espaces protégés, schémas départementaux de carrière…) et éviter l'artificialisation des zones à fort enjeu écologique.</p>
        <p className="fr-text--xs fr-mb-0"><strong>Le réseau Natura 2000</strong> rassemble des aires protégées créées par les États membres de l'Union européenne sur la base d'une liste d'habitats et d'espèces menacés, définies par les deux directives européennes Oiseaux et Habitats, Faune, Flore.</p>
	</div>
)

const DetailsFricheBySize: React.FC = () => (
	<div>
        <h6 className="fr-mb-1w">Calcul</h6>
		<p className="fr-text--xs">Les 4 catégories de taille sont déterminées à partir de l'ensemble des tailles des friches à l'échelle nationale, d'après les friches incluent dans les données <strong>Cartofriches</strong>.</p>
	</div>
)

const DetailsFricheByZonageType: React.FC = () => (
	<div>
        <h6 className="fr-mb-1w">Informations complémentaires</h6>
		<p className="fr-text--xs">
            N : Naturelle et Forestière, U : Urbaine, A : Agricole, AU : A Urbaniser, ZC : Zone Constructible, Zca : Zone Construstible d'activité, ZnC : Zone Non Constructible
        </p>
        <p className="fr-text--xs fr-mb-0">Une zone d'activité ou encore une zone d'activités économiques (ZAE) est, en France, un site réservé à l'implantation d'entreprises dans un périmètre donné. <a href="https://outil2amenagement.cerema.fr/outils/linventaire-des-zones-dactivites-economiques-izae" target="_blank" rel="noopener noreferrer">En savoir plus</a></p>
	</div>
)

const FricheStatus = ({ landData }: { landData: LandDetailResultType}) => {
    const { friche_status, name, friche_status_details } = landData;
    const { friche_reconvertie_count, friche_reconvertie_surface, friche_avec_projet_count, friche_avec_projet_surface, friche_sans_projet_count, friche_sans_projet_surface} = friche_status_details

    if (friche_status === FricheStatusEnum.GISEMENT_NUL_ET_SANS_POTENTIEL) {
        return (
            <p className="fr-text--sm">
                D'après les données disponible, il n'y actuellement <strong>aucune friche sans projet</strong> sur le territoire de {name}.<br />
                <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </p>
        )
    }

    if (friche_status === FricheStatusEnum.GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE) {
        return (
            <p className="fr-text--sm">
                D'après les données disponible, il n'y actuellement <strong>aucune friche sans projet</strong> sur le territoire de {name}.
                L'absence de friches sans projet est due à l'exploitation du potentiel des friches existantes.<br />
                En effet {friche_reconvertie_count} friche{friche_reconvertie_count > 0 ? 's' : ''} ont été reconvertie{friche_reconvertie_count > 0 ? 's' : ''}, représentant une surface totale de <strong>{formatNumber({ number: friche_reconvertie_surface })} ha</strong>,
                et {friche_avec_projet_count} friche{friche_avec_projet_count > 0 ? 's' : ''} sont actuellement en projet, représentant une surface totale de <strong>{formatNumber({ number: friche_avec_projet_surface })} ha.</strong><br />
                <strong>La réhabilitation de friches ne semble plus être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </p>
        )
    }

    if (friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE || friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION) {
        return (
            <p className="fr-text--sm">
                D'après les données disponible, il y a actuellement <strong>{friche_sans_projet_count} friche{friche_sans_projet_count > 0 ? 's' : ''} sans projet</strong> sur le territoire de {name}, représentant une surface totale de <strong>{formatNumber({ number: friche_sans_projet_surface })} ha</strong>.<br />
                <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </p>
        )
    }
}

const FricheStatutTriptic = ({ friche_status_details }: { friche_status_details: FricheStatusDetails }) => {
    const {
        friche_sans_projet_surface,
        friche_avec_projet_surface,
        friche_reconvertie_surface,
        friche_sans_projet_count,
        friche_avec_projet_count,
        friche_reconvertie_count
    } = friche_status_details;

    return (
        <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FrichesStatut
                    friche_count={friche_sans_projet_count}
                    friche_surface={friche_sans_projet_surface}
                    friche_statut={'friche sans projet'}
                />
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FrichesStatut
                    friche_count={friche_avec_projet_count}
                    friche_surface={friche_avec_projet_surface}
                    friche_statut={'friche avec projet'}
                />
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FrichesStatut
                    friche_count={friche_reconvertie_count}
                    friche_surface={friche_reconvertie_surface}
                    friche_statut={'friche reconvertie'}
                />
            </div>
        </div>
    )
}


export const Friches: React.FC<FrichesProps> = ({ landData }) => {
    const [selectedFriche, setSelectedFriche] = useState<[number, number] | null>(null);
    const mapSectionRef = useRef<HTMLDivElement>(null);
    const { land_id, land_type, friche_status } = landData;
    const { data: frichesData } = useGetLandFrichesQuery({ land_type, land_id });

    const {
        paginatedData,
        searchTerm,
        setSearchTerm,
        sortField,
        sortDirection,
        setSort,
        currentPage,
        totalPages,
        setPage,
        displayInfo
    } = useDataTable({
        data: frichesData || [],
        searchFields: [
            'site_id',
            'site_nom',
            'friche_type',
            'friche_statut',
            'friche_sol_pollution',
            'friche_zonage_environnemental',
            'friche_type_zone',
        ],
        itemsPerPage: 10,
        defaultSortField: 'friche_statut',
        defaultSortDirection: 'asc',
        customSortFunction: (a, b, field, direction) => {
            // Tri personnalisé pour le champ friche_statut
            if (field === 'friche_statut') {
                const aIndex = STATUT_ORDER.indexOf(a.friche_statut as any);
                const bIndex = STATUT_ORDER.indexOf(b.friche_statut as any);
                return direction === 'asc' ? aIndex - bIndex : bIndex - aIndex;
            }
            
            // Pour les autres champs, utiliser le tri par défaut
            const aValue = a[field];
            const bValue = b[field];
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            return 0;
        }
    });

    const handleFricheClick = (point: { type: "Point"; coordinates: [number, number] }) => {
        setSelectedFriche(point.coordinates);
    };

    // Scroll vers la carte quand une friche est sélectionnée
    useEffect(() => {
        if (selectedFriche && mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, [selectedFriche]);

    const columns = [
        {
            key: 'actions' as keyof LandFriche,
            label: 'Actions',
            sortable: false,
            render: (_: any, friche: LandFriche) => (
                <button
                    className="fr-btn fr-btn--sm fr-btn--secondary"
                    onClick={() => handleFricheClick(friche.point_on_surface)}
                >
                    <i className="bi bi-map"></i>&nbsp;Voir sur la carte
                </button>
            )
        },
        {
            key: 'site_nom' as keyof LandFriche,
            label: 'Nom',
            sortable: true,
        },
        {
            key: 'site_id' as keyof LandFriche,
            label: 'Identifiant',
            sortable: true
        },
        {
            key: 'friche_type' as keyof LandFriche,
            label: 'Type',
            sortable: true
        },
        {
            key: 'friche_statut' as keyof LandFriche,
            label: 'Statut',
            sortable: true,
            render: (value: any) => (
                <span className={`fr-badge fr-badge--no-icon text-lowercase ${STATUT_BADGE_CONFIG[value as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'friche_sol_pollution' as keyof LandFriche,
            label: 'Pollution',
            sortable: true
        },
        {
            key: 'surface' as keyof LandFriche,
            label: 'Surface (ha)',
            sortable: true,
            render: (value: number) => formatNumber({ number: value / 10000 })
        },
        {
            key: 'friche_is_in_zone_activite' as keyof LandFriche,
            label: 'Zone d\'activité',
            sortable: false,
            render: (value: boolean) => (
                <IconZoneActivite className={`bi ${value ? 'bi-check text-success' : 'bi-x text-danger'}`}/>
            )
        },
        {
            key: 'friche_zonage_environnemental' as keyof LandFriche,
            label: 'Zonage environnemental',
            sortable: true
        },
        {
            key: 'friche_type_zone' as keyof LandFriche,
            label: 'Type de zone',
            sortable: true
        }
    ];

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-grid-row fr-grid-row--gutters">
				<div className="fr-col-12">
                    <Guide
                        title="Qu'est-ce qu'une friche ?"
                        DrawerTitle="Qu'est-ce qu'une friche ?"
                        drawerChildren={
                            <>
                                <p className="fr-text--sm mb-3">
                                    La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : "tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables".
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Une friche est donc une zone désaffectée après avoir connu une activité économique (industrielle ou commerciale), des usages résidentiels ou des équipements. On estime que ces sites pourraient représenter en France entre 90 000 et 150 000 hectares d'espaces inemployés, l'équivalent de plus de six ans d'artificialisation.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Recycler des friches peut être un moyen non seulement de limiter l'artificialisation des sols, mais aussi de redynamiser des territoires et de réhabiliter des sites pollués.
                                </p>
                            </>
                        }
                    >
                        La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : "tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables".
                    </Guide>
				</div>
			</div>
            <h2 className="fr-mt-5w">Vue d'ensemble</h2>
            <FricheStatutTriptic friche_status_details={landData.friche_status_details} />
            
            <div className="fr-mb-5w fr-mt-5w">
                <div className="bg-white fr-p-4w rounded fr-mb-4w">
                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12">
                            <h3 className="fr-text--lg fr-mb-2w">
                                <i className="bi bi-lightning-charge text-primary fr-mr-1w" /> Les friches sans projet : un levier majeur actionnable pour la sobriété foncière
                            </h3>
                            <FricheStatus landData={landData} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="fr-mb-7w fr-mt-5w">
				<div className="bg-white fr-p-4w rounded">
					<h6>
                        D'où proviennent ces données ? 
					</h6>
					<div className="fr-highlight fr-highlight--no-margin">
						<p className="fr-text--sm">
                            Les données utilisées proviennent du recensement des friches réalisé par le CEREMA dans le cadre du dispositif Cartofriches.<br />
                            On distingue deux sources de données : les friches pré-identifiées au niveau national par le Cerema, et les friches consolidées par des acteurs des territoires qui possèdent un observatoire ou réalisent des études. Ces contributeurs locaux à Cartofriches sont listés ici : <a href="https://artificialisation.biodiversitetousvivants.fr/cartofriches/observatoires-locaux" target="_blank" rel="noopener noreferrer">https://artificialisation.biodiversitetousvivants.fr/cartofriches/observatoires-locaux</a><br />
						</p>
                        <p className="fr-text--sm">
                            <strong>
                            <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" /> Il est important de noter que ces données ne sont ni exhaustives ni homogènes sur l'ensemble du territoire national, et dépendent notamment de la présence ou non d'un observatoire local.
                            </strong>
                        </p>
					</div>
				</div>
			</div>
            {[
                FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION,
                FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE,
            ].includes(friche_status) && (
                <>
                    <h2 className="fr-mt-5w">Analyse des friches sans projet</h2>
                    <div className="fr-callout fr-icon-information-line fr-mb-3w">
                        <h3 className="fr-callout__title fr-text--md">Pourquoi se concentrer sur les friches sans projet ?</h3>
                        <p className="fr-callout__text fr-text--sm">
                            Les friches sans projet représentent des opportunités concrètes pour limiter l'artificialisation des sols. 
                            Comprendre leurs caractéristiques (type, surface, pollution, zonage, ...) permet d'identifier les opportunités de réhabilitation les plus pertinentes.
                        </p>
                    </div>
                    <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                        {FRICHES_CHARTS.map((chart) => (
                            <div key={chart.id} className="fr-col-12 fr-col-md-6">
                                <div className="bg-white fr-p-2w rounded">
                                    <FrichesChart
                                        id={chart.id}
                                        land_id={land_id}
                                        land_type={land_type}
                                        sources={['cartofriches']}
                                        showDataTable={true}
                                    >
                                        {chart.id === 'friche_zonage_environnemental' && <DetailsFricheZonageEnvironnemental />}
                                        {chart.id === 'friche_surface' && <DetailsFricheBySize />}
                                        {chart.id === 'friche_zonage_type' && <DetailsFricheByZonageType />}
                                    </FrichesChart>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <h2 className="fr-mt-7w">Détail des friches</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12">
                    <SearchContainer>
                        <SearchInput
                            id="search-friches"
                            placeholder="Recherchez par identifiant, type, statut, pollution, zonage..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </SearchContainer>
                    <DataTable
                        data={paginatedData}
                        columns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={setSort}
                        caption="Liste détaillée des friches du territoire"
                        className="fr-mb-2w"
                        keyField="site_id"
                        tooltipFields={['site_nom']}
                    />
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        )}
                        <DisplayPaginationInfo className="fr-text--xs">
                            {displayInfo.start}-{displayInfo.end} sur {displayInfo.total}
                        </DisplayPaginationInfo>
                    </div>
                </div>
            </div>
            <h2 className="fr-mt-2w">Carte des friches</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w" ref={mapSectionRef}>
                <div className="fr-col-12">
                    <FrichesMap
                        landData={landData}
                        center={selectedFriche}
                    />
                </div>
            </div>
            <h4 className="fr-mt-10w">Pour aller plus loin dans votre démarche de réhabilitation de friches </h4>
            <div className="fr-callout fr-icon-information-line">
                <h3 className="fr-callout__title fr-text--md">Estimez les impacts environnementaux, sociaux et économiques de votre projet de réhabilitation grâce à Bénéfriches</h3>
                <p className="fr-callout__text fr-text--sm">Vous avez un projet d'aménagement urbain ou un projet photovoltaïque sur une friche ? Calculez les impacts de votre projet grâce à la plateforme Bénéfriches !</p>
                <br />
                <a target="_blank" rel="noopener noreferrer external" title="" href="https://benefriches.ademe.fr/" className="fr-notice__link fr-link fr-text--sm">
                    Accèder à Bénéfriches
                </a>
            </div>
            <div className="fr-callout fr-icon-information-line">
                <h3 className="fr-callout__title fr-text--md">Faites-vous accompagner gratuitement dans la réhabilitation des friches de votre territoire grâce à UrbanVitaliz</h3>
                <p className="fr-callout__text fr-text--sm">UrbanVitaliz est un service public gratuit d'appui aux collectivités pour la reconversion des friches, assuré par des urbanistes ainsi que les conseillers publics (selon les territoires : DDT, DREAL, EPF...)</p>
                <br />
                <a target="_blank" rel="noopener noreferrer external" title="" href="https://urbanvitaliz.fr/" className="fr-notice__link fr-link fr-text--sm">
                    Accèder à UrbanVitaliz
                </a>
            </div>
		</div>
	);
};
