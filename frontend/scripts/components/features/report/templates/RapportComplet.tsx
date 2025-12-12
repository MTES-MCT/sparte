import React from 'react';
import { LandDetailResultType } from '@services/types/land';
import {
    ContentZone,
    ContentZoneMode,
} from '../editor';
import {
    ReportContainer,
    PrintLayout,
    PrintContent,
    MainContent,
} from '../styles';
import ChartWithTable from '@components/charts/ChartWithTable';
import CoverPage from './CoverPage';
import AvailableDataPage from './AvailableDataPage';

export interface RapportCompletContent {
    trajectoire?: string;
    consommation_annuelle?: string;
    consommation_destinations?: string;
    comparison_absolue?: string;
    comparison_relative?: string;
    artificialisation_detail?: string;
    artificialisation_couverture?: string;
    artificialisation_usage?: string;
    impermeabilisation_couverture?: string;
    impermeabilisation_usage?: string;
}

interface RapportCompletProps {
    landData: LandDetailResultType;
    content: RapportCompletContent;
    mode: ContentZoneMode;
    onContentChange?: (key: string, value: string) => void;
}

const CONSO_START_YEAR = 2011;
const CONSO_END_YEAR = 2023;

const RapportComplet: React.FC<RapportCompletProps> = ({
    landData,
    content,
    mode,
    onContentChange,
}) => {
    const handleChange = (key: keyof RapportCompletContent) => (value: string) => {
        onContentChange?.(key, value);
    };

    // Récupérer le dernier millésime disponible
    const millesimes = landData.millesimes || [];
    const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
    const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

    const reportContent = (
        <>
            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Définition de la consommation d'espaces NAF
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Définition de la consommation d'espaces NAF et contexte juridique</h2>

                <p className="fr-text--sm">
                    Chaque année, 24 000 ha d'espaces NAF sont consommés en moyenne en France, soit près de 5 terrains de football par heure. 
                    Tous les territoires sont concernés : en particulier 61% de la consommation d'espaces est constatée dans les territoires sans tension immobilière.
                </p>

                <p className="fr-text--sm">
                    Les conséquences sont écologiques (érosion de la biodiversité, aggravation du risque de ruissellement, limitation du stockage carbone) 
                    mais aussi socio-économiques (coûts des équipements publics, augmentation des temps de déplacement et de la facture énergétique des ménages, 
                    dévitalisation des territoires en déprise, diminution du potentiel de production agricole etc.).
                </p>

                <div className="fr-callout">
                    <h3 className="fr-callout__title">Objectif Zéro Artificialisation Nette (ZAN)</h3>
                    <p className="fr-callout__text">
                        La France s'est donc fixée l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, 
                        avec un objectif intermédiaire de réduction de moitié de la consommation d'espaces naturels, agricoles et forestiers 
                        dans les dix prochaines années 2021-2031 par rapport à la décennie précédente 2011-2021.
                    </p>
                </div>

                <h3 className="fr-h3">Cadre législatif</h3>
                <p className="fr-text--sm">
                    Les dispositions introduites par la <strong>loi n° 2021-1104 du 22 août 2021</strong> portant lutte contre le dérèglement climatique 
                    (dite « Loi Climat et résilience ») ont été complétées par la <strong>loi n° 2023-630 du 20 juillet 2023</strong> visant à faciliter 
                    la mise en œuvre des objectifs de lutte contre l'artificialisation des sols.
                </p>

                <h3 className="fr-h3">Période 2021-2031 : Consommation d'espaces NAF</h3>
                <p className="fr-text--sm">
                    Pour la période 2021-2031, il s'agit de raisonner en consommation d'espaces. La consommation d'espaces NAF est entendue comme 
                    « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).
                </p>
                <p className="fr-text--sm">
                    Au niveau national, la consommation d'espaces NAF est mesurée par les fichiers fonciers retraités par le CEREMA.
                </p>

                <h3 className="fr-h3">À partir de 2031 : Artificialisation</h3>
                <p className="fr-text--sm">
                    A partir de 2031, il s'agit de raisonner en artificialisation. L'artificialisation nette est définie comme 
                    « le solde de l'artificialisation et de la désartificialisation des sols constatées sur un périmètre et sur une période donnés » 
                    (article L.101-2-1 du code de l'urbanisme).
                </p>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Trajectoires de consommation d'espace
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Trajectoires de consommation d'espace</h2>

                <p className="fr-text--sm">
                    La loi Climat & Résilience fixe l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, 
                    avec un objectif intermédiaire de réduction de moitié de la consommation d'espaces naturels, agricoles et forestiers 
                    dans les dix prochaines années 2021-2031 par rapport à la décennie précédente 2011-2021.
                </p>

                <div className="fr-callout fr-callout--brown-caramel">
                    <h3 className="fr-callout__title">Déclinaison dans les documents d'urbanisme</h3>
                    <p className="fr-callout__text">
                        Cette trajectoire nationale progressive est à décliner dans les documents de planification et d'urbanisme :
                    </p>
                    <ul className="fr-callout__text">
                        <li>Avant le <strong>22 novembre 2024</strong> pour les SRADDET</li>
                        <li>Avant le <strong>22 février 2027</strong> pour les SCoT</li>
                        <li>Avant le <strong>22 février 2028</strong> pour les PLU(i) et cartes communales</li>
                    </ul>
                </div>

                <h3 className="fr-h3">Projets d'envergure nationale</h3>
                <p className="fr-text--sm">
                    La loi prévoit que la consommation foncière des projets d'envergure nationale ou européenne et d'intérêt général majeur 
                    sera comptabilisée au niveau national. Un forfait de 12 500 hectares est déterminé pour la période 2021-2031.
                </p>

                <h3 className="fr-h3">Garanties pour les communes</h3>
                <p className="fr-text--sm">
                    Une surface minimale d'un hectare de consommation est garantie à toutes les communes couvertes par un document d'urbanisme 
                    prescrit, arrêté ou approuvé avant le 22 août 2026, pour la période 2021-2031.
                </p>

                <div className="fr-callout fr-callout--green-emeraude">
                    <h3 className="fr-callout__title">Simulation pour votre territoire</h3>
                    <p className="fr-callout__text">
                        Mon Diagnostic Artificialisation vous permet de vous projeter dans cet objectif de réduction de la consommation d'espaces NAF 
                        d'ici à 2031 et de simuler divers scénarii. Le graphique ci-dessous présente un objectif de réduction de 50%.
                    </p>
                </div>

                <ChartWithTable
                    chartId="objective_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ target_2031_custom: 50 }}
                    sources={["majic"]}
                />
            </section>

            <ContentZone
                content={content.trajectoire || ''}
                mode={mode}
                onChange={handleChange('trajectoire')}
                placeholder="Commentez la trajectoire. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Détail de la consommation d'espaces
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Détail de la consommation d'espaces</h2>

                <h3 className="fr-h3">Évolution annuelle de la consommation totale</h3>
                <p className="fr-text--sm">
                    Le graphique ci-dessous présente l'évolution annuelle de la consommation d'espaces NAF sur votre territoire.
                </p>

                <ChartWithTable
                    chartId="annual_total_conso_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />

                {landData.child_land_types && landData.child_land_types.length > 0 && (
                    <>
                        <h3 className="fr-h3">Cartographie de la consommation relative</h3>
                        <p className="fr-text--sm">
                            La carte ci-dessous présente la consommation d'espaces relative à la surface de chaque territoire (en % de la surface totale).
                        </p>
                        <ChartWithTable
                            chartId="conso_map_relative_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{
                                start_date: String(CONSO_START_YEAR),
                                end_date: String(CONSO_END_YEAR),
                                child_land_type: landData.child_land_types[0],
                            }}
                            sources={["majic"]}
                            isMap
                        />

                        <h3 className="fr-h3">Cartographie de la consommation absolue</h3>
                        <p className="fr-text--sm">
                            La carte ci-dessous présente la consommation d'espaces en valeur absolue (en hectares).
                        </p>
                        <ChartWithTable
                            chartId="conso_map_bubble_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{
                                start_date: String(CONSO_START_YEAR),
                                end_date: String(CONSO_END_YEAR),
                                child_land_type: landData.child_land_types[0],
                            }}
                            sources={["majic"]}
                            isMap
                        />
                    </>
                )}
            </section>

            <ContentZone
                content={content.consommation_annuelle || ''}
                mode={mode}
                onChange={handleChange('consommation_annuelle')}
                placeholder="Commentez la consommation annuelle. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Consommation par destination
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Consommation par destination</h2>

                <h3 className="fr-h3">Évolution annuelle par destination</h3>
                <p className="fr-text--sm">
                    La répartition de la consommation d'espaces par destination permet d'identifier les principaux facteurs de consommation : 
                    habitat, activités économiques, infrastructures de transport, etc.
                </p>

                <ChartWithTable
                    chartId="chart_determinant_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />

                <h3 className="fr-h3">Répartition totale par destination</h3>
                <p className="fr-text--sm">
                    Le graphique ci-dessous présente la répartition en pourcentage de la consommation totale par destination 
                    sur la période {CONSO_START_YEAR}-{CONSO_END_YEAR}.
                </p>

                <ChartWithTable
                    chartId="pie_determinant_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                    showTable={false}
                />
            </section>

            <ContentZone
                content={content.consommation_destinations || ''}
                mode={mode}
                onChange={handleChange('consommation_destinations')}
                placeholder="Commentez la consommation d'espaces par destinations. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Comparaison avec d'autres territoires
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Comparaison avec d'autres territoires</h2>

                <p className="fr-text--sm">
                    Cette section permet de situer votre territoire par rapport à d'autres territoires. 
                    La comparaison porte sur la consommation absolue (en hectares) et la consommation relative (rapportée à la surface du territoire).
                </p>

                <div className="fr-callout fr-callout--brown-caramel">
                    <h3 className="fr-callout__title">Note méthodologique</h3>
                    <p className="fr-callout__text">
                        Si vous ne les avez pas personnalisés, les territoires de comparaison sont sélectionnés automatiquement 
                        en fonction de leur proximité géographique avec votre territoire.
                    </p>
                </div>

                <h3 className="fr-h3">Consommation absolue</h3>
                <p className="fr-text--sm">
                    Le graphique ci-dessous présente la consommation annuelle d'espaces en hectares pour votre territoire et les territoires de comparaison.
                </p>

                <ChartWithTable
                    chartId="comparison_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />
            </section>

            <ContentZone
                content={content.comparison_absolue || ''}
                mode={mode}
                onChange={handleChange('comparison_absolue')}
                placeholder="Commentez la consommation absolue de votre territoire par rapport aux territoires de comparaison."
            />

            {/* ═══════════════════════════════════════════════════════════════════
                SECTION: Consommation relative
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="fr-mb-6w">
                <h2 className="fr-h2">Consommation relative</h2>

                <p className="fr-text--sm">
                    Pour une comparaison plus équitable entre territoires de tailles différentes, la consommation peut être rapportée 
                    à la surface du territoire (en % de la surface). Cela permet de mieux comparer l'intensité de la consommation d'espaces.
                </p>

                <ChartWithTable
                    chartId="surface_proportional_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />
            </section>

            <ContentZone
                content={content.comparison_relative || ''}
                mode={mode}
                onChange={handleChange('comparison_relative')}
                placeholder="Commentez la consommation relative de votre territoire par rapport aux territoires de comparaison."
            />

            {/* ═══════════════════════════════════════════════════════════════════
                SECTIONS OCS GE (si disponible)
            ═══════════════════════════════════════════════════════════════════ */}
            {landData.has_ocsge && (
                <>
                    {/* Artificialisation - Définition */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Artificialisation</h2>

                        <h3 className="fr-h3">Définition légale</h3>
                        <p className="fr-text--sm">
                            L'article 192 modifie le code de l'urbanisme et donne une définition de l'artificialisation telle qu'elle doit être considérée 
                            et évaluée dans les documents d'urbanisme et de planification :
                        </p>

                        <blockquote className="fr-quote">
                            <p>
                                « Au sein des documents de planification et d'urbanisme, lorsque la loi ou le règlement prévoit des objectifs de réduction 
                                de l'artificialisation des sols ou de son rythme, ces objectifs sont fixés et évalués en considérant comme :
                            </p>
                            <ul>
                                <li><strong>a) Artificialisée</strong> une surface dont les sols sont soit imperméabilisés en raison du bâti ou d'un revêtement, 
                                soit stabilisés et compactés, soit constitués de matériaux composites ;</li>
                                <li><strong>b) Non artificialisée</strong> une surface soit naturelle, nue ou couverte d'eau, soit végétalisée, 
                                constituant un habitat naturel ou utilisée à usage de cultures.</li>
                            </ul>
                        </blockquote>

                        <div className="fr-callout">
                            <h3 className="fr-callout__title">Qu'est-ce que l'OCS GE ?</h3>
                            <p className="fr-callout__text">
                                L'<strong>Occupation des Sols à Grande Échelle (OCS GE)</strong> est une base de données géographique qui décrit de manière précise 
                                l'occupation et l'usage des sols sur l'ensemble du territoire français. Elle combine deux nomenclatures :
                            </p>
                            <ul className="fr-callout__text">
                                <li><strong>Couverture du sol (CS)</strong> : ce qui couvre physiquement le sol</li>
                                <li><strong>Usage du sol (US)</strong> : l'utilisation faite du sol</li>
                            </ul>
                        </div>
                    </section>

                    {/* Artificialisation - Détail */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Détail de l'artificialisation</h2>

                        <div className="fr-callout fr-callout--blue-ecume">
                            <p className="fr-callout__text">
                                Les données d'artificialisation sont issues de l'OCS GE et sont disponibles à partir de 2017. 
                                Elles permettent de mesurer précisément les surfaces artificialisées et désartificialisées sur le territoire.
                            </p>
                        </div>

                        <h3 className="fr-h3">Synthèse de l'artificialisation</h3>
                        <p className="fr-text--sm">
                            Le graphique ci-dessous présente une vue d'ensemble de l'artificialisation sur votre territoire.
                        </p>

                        <ChartWithTable
                            chartId="artif_synthese_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            sources={["ocsge"]}
                            showTable={false}
                        />

                        <h3 className="fr-h3">Flux d'artificialisation et désartificialisation</h3>
                        <p className="fr-text--sm">
                            L'artificialisation nette correspond au solde entre les surfaces nouvellement artificialisées et les surfaces désartificialisées.
                        </p>

                        <ChartWithTable
                            chartId="artif_net_flux_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                            showTable={false}
                        />

                        <div className="fr-callout">
                            <h3 className="fr-callout__title">Points clés</h3>
                            <ul className="fr-callout__text">
                                <li><strong>Artificialisation brute</strong> : surfaces passant d'un état non artificialisé à artificialisé</li>
                                <li><strong>Désartificialisation</strong> : surfaces passant d'un état artificialisé à non artificialisé</li>
                                <li><strong>Artificialisation nette</strong> : différence entre les deux</li>
                                <li><strong>Objectif ZAN 2050</strong> : atteindre une artificialisation nette égale à zéro</li>
                            </ul>
                        </div>

                        {landData.child_land_types && landData.child_land_types.length > 0 && (
                            <>
                                <h3 className="fr-h3">Cartographie de l'artificialisation</h3>
                                <p className="fr-text--sm">
                                    La carte ci-dessous présente la proportion de sols artificialisés par territoire.
                                </p>

                                <ChartWithTable
                                    chartId="artif_map_export"
                                    landId={landData.land_id}
                                    landType={landData.land_type}
                                    params={{
                                        index: maxIndex,
                                        previous_index: minIndex,
                                        child_land_type: landData.child_land_types[0],
                                    }}
                                    sources={["ocsge"]}
                                    isMap
                                />
                            </>
                        )}
                    </section>

                    <ContentZone
                        content={content.artificialisation_detail || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_detail')}
                        placeholder="Commentez les données d'artificialisation présentées. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                    />

                    {/* Artificialisation par couverture */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Répartition par type de couverture</h2>

                        <p className="fr-text--sm">
                            La couverture du sol décrit la nature physique de ce qui recouvre le territoire : 
                            surfaces imperméabilisées (bâti, routes, parkings), surfaces stabilisées (cours, allées), surfaces herbacées, etc.
                        </p>

                        <ChartWithTable
                            chartId="pie_artif_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3 className="fr-h3">Flux d'artificialisation par type de couverture</h3>
                        <p className="fr-text--sm">
                            Ce graphique montre quels types de couverture ont été principalement artificialisés ou désartificialisés au cours de la période.
                        </p>

                        <ChartWithTable
                            chartId="artif_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </section>

                    <ContentZone
                        content={content.artificialisation_couverture || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_couverture')}
                        placeholder="Commentez la répartition des surfaces artificialisées par type de couverture."
                    />

                    {/* Artificialisation par usage */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Répartition par type d'usage</h2>

                        <p className="fr-text--sm">
                            L'usage du sol indique la fonction ou l'activité qui se déroule sur le territoire : 
                            usage résidentiel, production (agriculture, industrie), services, infrastructures de transport, etc.
                        </p>

                        <ChartWithTable
                            chartId="pie_artif_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3 className="fr-h3">Flux d'artificialisation par type d'usage</h3>
                        <p className="fr-text--sm">
                            Ce graphique montre quels usages ont contribué à l'artificialisation ou à la désartificialisation au cours de la période.
                        </p>

                        <ChartWithTable
                            chartId="artif_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </section>

                    <ContentZone
                        content={content.artificialisation_usage || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_usage')}
                        placeholder="Commentez la répartition des surfaces artificialisées par type d'usage."
                    />

                    {/* Imperméabilisation par couverture */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Répartition de l'imperméabilisation par type de couverture</h2>

                        <p className="fr-text--sm">
                            La couverture du sol décrit la nature physique de ce qui recouvre le territoire. 
                            L'imperméabilisation correspond aux surfaces dont les sols sont rendus imperméables en raison du bâti ou d'un revêtement.
                        </p>

                        <ChartWithTable
                            chartId="pie_imper_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3 className="fr-h3">Flux d'imperméabilisation par type de couverture</h3>
                        <p className="fr-text--sm">
                            Ce graphique montre quels types de couverture ont contribué à l'imperméabilisation ou à la désimperméabilisation.
                        </p>

                        <ChartWithTable
                            chartId="imper_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </section>

                    <ContentZone
                        content={content.impermeabilisation_couverture || ''}
                        mode={mode}
                        onChange={handleChange('impermeabilisation_couverture')}
                        placeholder="Commentez la répartition des surfaces imperméabilisées par type de couverture."
                    />

                    {/* Imperméabilisation par usage */}
                    <section className="fr-mb-6w">
                        <h2 className="fr-h2">Répartition de l'imperméabilisation par type d'usage</h2>

                        <p className="fr-text--sm">
                            L'usage du sol indique la fonction ou l'activité qui se déroule sur le territoire.
                        </p>

                        <ChartWithTable
                            chartId="pie_imper_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3 className="fr-h3">Flux d'imperméabilisation par type d'usage</h3>
                        <p className="fr-text--sm">
                            Ce graphique montre quels usages ont contribué à l'imperméabilisation ou à la désimperméabilisation.
                        </p>

                        <ChartWithTable
                            chartId="imper_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </section>

                    <ContentZone
                        content={content.impermeabilisation_usage || ''}
                        mode={mode}
                        onChange={handleChange('impermeabilisation_usage')}
                        placeholder="Commentez la répartition des surfaces imperméabilisées par type d'usage."
                    />
                </>
            )}
        </>
    );

    if (mode === 'print') {
        return (
            <PrintLayout>
                <PrintContent>
                    <CoverPage
                        landData={landData}
                        reportTitle="Rapport Complet"
                        reportSubtitle="Diagnostic territorial de sobriété foncière"
                    />
                    <AvailableDataPage
                        landData={landData}
                        consoStartYear={CONSO_START_YEAR}
                        consoEndYear={CONSO_END_YEAR}
                    />
                    <MainContent>
                        {reportContent}
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    return (
        <ReportContainer>
            <CoverPage
                landData={landData}
                reportTitle="Rapport Complet"
                reportSubtitle="Diagnostic territorial de sobriété foncière"
            />
            <AvailableDataPage
                landData={landData}
                consoStartYear={CONSO_START_YEAR}
                consoEndYear={CONSO_END_YEAR}
            />
            <MainContent>
                {reportContent}
            </MainContent>
        </ReportContainer>
    );
};

export default RapportComplet;
