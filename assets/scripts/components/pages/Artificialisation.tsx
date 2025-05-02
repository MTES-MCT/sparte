import React from "react";
import Guide from "@components/widgets/Guide";
import OcsgeMatricePassage from "@images/ocsge_matrice_passage.png";
import {
  useGetArtifZonageIndexQuery,
  useGetLandArtifStockIndexQuery,
} from "@services/api";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType, MillesimeByIndex } from "@services/types/land";
import { OcsgeMapContainer } from "@components/map/ocsge/OcsgeMapContainer";
import styled, { css } from "styled-components";
import { ArtifPercentRate } from "@components/charts/artificialisation/ArtifPercentRate";
import { formatNumber } from "@utils/formatUtils";
import { LandMillesimeTable } from "@components/widgets/LandMillesimeTable";
import {
  defautLandArtifStockIndex,
  LandArtifStockIndex,
} from "@services/types/landartifstockindex";
import { SeuilsSchemas } from "@components/features/SeuilsSchemas";
import { ZonageType } from "scripts/types/ZonageType";

export const BigNumberStyle = css`
  font-size: 3rem;
  font-weight: bold;
  line-height: 3rem;
`;

export const SurfaceArtif = styled.div`
  ${BigNumberStyle}
`;

export const PercentArtif = styled.div`
  ${BigNumberStyle}
  color: #ff7e7e;
`;

export const OcsgeMillesimeSelector = ({
  index,
  setIndex,
  byDepartement,
  setByDepartement,
  millesimes_by_index,
  shouldDisplayByDepartementBtn,
}: {
  index: number;
  setIndex: (index: number) => void;
  byDepartement: boolean;
  setByDepartement: (byDepartement: boolean) => void;
  millesimes_by_index: MillesimeByIndex[];
  shouldDisplayByDepartementBtn: boolean;
}) => {
    /* 

    Dans le cas où l'option "Afficher par département" est activée,
    un bouton supplémentaire est affiché pour permettre à l'utilisateur
    de basculer entre les deux modes d'affichage.
    
    Cette option est activée pour les territoires interdépartementaux.
    Comme les années peuvent être différentes d'un département à
    l'autre, on affiche uniquement le numéro (l'index) du millésime
    (ex: Millésime #1) au lieu de l'année (ex: 2023-2025).

    */
  return (
    <ul className="fr-btns-group fr-btns-group--inline-sm">
      {millesimes_by_index.map((m) => (
        <li key={m.years}>
          <button
            type="button"
            className={`fr-btn ${m.index !== index ? "fr-btn--tertiary" : ""}`}
            onClick={() => setIndex(m.index)}
            title={m.years}
          >
            {shouldDisplayByDepartementBtn ? `Millésime #${m.index}` : m.years}
          </button>
        </li>
      ))}
      {shouldDisplayByDepartementBtn && (
        <li>
          <button
            onClick={(e) => setByDepartement(!byDepartement)}
            type="button"
            className="fr-btn fr-btn--tertiary"
          >
            <p>
              <span>
                {byDepartement
                  ? "Afficher par groupe de millésime"
                  : "Afficher par département"}
              </span>
              &nbsp;
              <i
                className="bi bi-info-circle"
                aria-describedby="tooltip-multi-dpt"
                data-fr-js-tooltip-referent="true"
              >

                </i>
                <span id="tooltip-multi-dpt" className="fr-tooltip fr-placement" role="tooltip" aria-hidden="true">
                  {byDepartement
                    ? "Ce mode rassemble les données par groupe d'années, ce qui permet d'afficher une vue d'ensemble"
                    : "Ce mode distingue les données par département, ce qui permet de ne pas mélanger les données issues d'années différentes"
                  }
                </span>
            </p>
          </button>
        </li>
      )}
    </ul>
  );
};

export const Artificialisation = ({
  projectData,
  landData,
}: {
  projectData: ProjectDetailResultType;
  landData: LandDetailResultType;
}) => {
  const { land_id, land_type } = projectData;
  const {
    surface,
    millesimes_by_index,
    millesimes,
    years_artif,
    child_land_types,
    name,
    is_interdepartemental,
  } = landData || {};

  const defaultStockIndex =
    millesimes_by_index.length > 0
      ? Math.max(...millesimes_by_index.map((e) => e.index))
      : 2;

  const [stockIndex, setStockIndex] = React.useState(defaultStockIndex);
  const [byDepartement, setByDepartement] = React.useState(false);
  const [childLandType, setChildLandType] = React.useState(
    child_land_types ? child_land_types[0] : undefined
  );

  const { data: artifZonageIndex } = useGetArtifZonageIndexQuery({
    land_type: land_type,
    land_id: land_id,
    millesime_index: stockIndex,
  });

  const {
    data: landArtifStockIndexes,
  }: {
    landArtifStockIndex: LandArtifStockIndex[];
  } = useGetLandArtifStockIndexQuery({
    land_type: land_type,
    land_id: land_id,
    millesime_index: defaultStockIndex,
  });
  const landArtifStockIndex: LandArtifStockIndex =
    landArtifStockIndexes?.find(
      (e: LandArtifStockIndex) => e.millesime_index === defaultStockIndex
    ) ?? defautLandArtifStockIndex;

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-mb-7w">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12">
            <Guide
              title="Qu'est-ce que l'artificialisation des sols ?"
              contentHtml={`
                L'artificialisation est définie dans l'<a href='https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957221' target='_blank'>
                article 192 de la loi Climat et Resilience</a> comme «<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol, en particulier de ses fonctions biologiques, hydriques et climatiques</strong>, ainsi que de son potentiel agronomique par son occupation ou son usage.»
                <br />
                Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.
            `}
            />
          </div>
        </div>
        <div className="bg-white fr-p-4w rounded">
          <h6>
            Quels sont les objectifs nationaux de réduction de
            l'artificialisation ?
          </h6>
          <div className="fr-highlight fr-highlight--no-margin">
            <p className="fr-text--sm">
              Afin de préserver les sols naturels, agricoles et forestiers, la
              loi Climat et Résilience fixe à partir de 2031 un cap clair
              :&nbsp;<strong>atteindre l'équilibre entre les surfaces artificialisées et désartificialisées</strong>, c'est-à-dire un objectif de <strong><u>« zéro artificialisation nette »</u></strong> des
              sols, à horizon 2050.
            </p>
          </div>
        </div>
      </div>
      <hr />
      <h2>
        Artificialisation des sols de {name} en {years_artif.join(", ")}
      </h2>
      <div className="fr-mb-5w">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-8">
            <div className="bg-white fr-p-2w h-100 rounded">
              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-7">
                  <ArtifPercentRate
                    percentageArtificialized={landArtifStockIndex.percent}
                  />
                </div>
                <div className="fr-col-12 fr-col-md-5">
                  <SurfaceArtif className="fr-mt-3w">
                    {formatNumber({ number: landArtifStockIndex.surface })}ha
                  </SurfaceArtif>

                  <span
                    className={`fr-badge ${
                      landArtifStockIndex.flux_surface >= 0
                        ? "fr-badge--error"
                        : "fr-badge--success"
                    } fr-badge--error fr-badge--sm fr-badge--no-icon`}
                  >
                    {formatNumber({
                      number: landArtifStockIndex.flux_surface,
                      addSymbol: true,
                    })}{" "}
                    ha
                    {landArtifStockIndex.flux_surface >= 0 ? (
                      <i className="bi bi-arrow-up-right fr-ml-1w"></i>
                    ) : (
                      <i className="bi bi-arrow-down-right fr-ml-1w"></i>
                    )}
                  </span>
                  <span className="fr-text--sm">
                    <i>
                      &nbsp;depuis{" "}
                      {landArtifStockIndex.flux_previous_years.join(", ")}
                    </i>
                  </span>
                  <PercentArtif className="fr-mt-3w">
                    {formatNumber({ number: landArtifStockIndex.percent })}%
                  </PercentArtif>
                  <p>du territoire</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fr-col-12 fr-col-lg-4">
            <Guide
              title="Comprendre les données"
              contentHtml={`
            <p>En ${years_artif.join(
                ", "
            )}, sur le territoire de ${name}, <strong>${formatNumber(
                { number: landArtifStockIndex.surface }
              )} ha</strong> étaient artificialisés, ce qui correspond à <strong>${formatNumber(
                { number: landArtifStockIndex.percent }
              )}%</strong> de la surface totale (${formatNumber({
                number: surface,
              })} ha) du territoire.</p>
                                <p>La surface artificialisée a ${
                                  landArtifStockIndex.flux_surface >= 0
                                    ? "augmenté"
                                    : "diminué"
                                } de <strong>${formatNumber({
                number: landArtifStockIndex.flux_surface,
              })} ha depuis ${landArtifStockIndex.flux_previous_years.join(
                ", "
              )}</strong>.</p>
                            `}
              column
            />
          </div>
        </div>
        <div className="bg-white fr-p-4w rounded fr-mt-5w">
          <h6>D'où proviennent ces données&nbsp;?</h6>
          <div className="fr-highlight fr-highlight--no-margin">
            <p className="fr-text--sm">
              La mesure de l'artificialisation d'un territoire repose sur la
              donnée{" "}
              <strong>OCS GE (Occupation du Sol à Grande Echelle)</strong>,
              actuellement en cours de production par l'IGN. Cette donnée est
              produite tous les 3 ans par département. Chaque production est
              appelée un <strong>millésime</strong>.
            </p>
          </div>
          <div className="fr-alert fr-alert--info">
            <h6 className="fr-alert__title">
              Millésimes disponibles pour le territoire de{" "}
              <strong>{projectData?.territory_name}</strong>
            </h6>
            {is_interdepartemental ? (
              <div className="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-mb-1w">
                <LandMillesimeTable millesimes={millesimes} />
              </div>
            ) : (
              <>
                {millesimes
                  .map((m) => m.year)
                  .toSorted((a, b) => a - b)
                  .map((year) => (
                    <>
                      <div className="fr-badge">{year}</div>{" "}
                    </>
                  ))}
              </>
            )}
          </div>
          <p className="fr-mt-2w fr-text--sm">
            Ces données sont disponibles en téléchargement sur le site de l'IGN
            :&nbsp;<a
              className="fr-link"
              href="https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement"
              target="_blank"
            >
              https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement
            </a>
          </p>
        </div>
      </div>
      <div className="fr-mb-7w">
        <h2>
          Répartition des surfaces artificialisées par type de couverture et
          d'usage
        </h2>
        <div className="bg-white fr-p-4w rounded">
          <OcsgeMillesimeSelector
            millesimes_by_index={millesimes_by_index}
            index={stockIndex}
            setIndex={setStockIndex}
            byDepartement={byDepartement}
            setByDepartement={setByDepartement}
            shouldDisplayByDepartementBtn={is_interdepartemental}
          />
          <div className="fr-grid-row fr-grid-row--gutters">
            {byDepartement ? (
              millesimes
                .filter((e) => e.index === stockIndex)
                .map((m) => (
                  <div
                    key={`${m.index}_${m.departement}`}
                    className={`fr-col-${Math.round(
                      12 / millesimes_by_index.length
                    )}`}
                  >
                    <OcsgeGraph
                      id="pie_artif_by_couverture"
                      land_id={land_id}
                      land_type={land_type}
                      params={{
                        index: m.index,
                        departement: m.departement,
                      }}
                    />
                    <OcsgeGraph
                      id="pie_artif_by_usage"
                      land_id={land_id}
                      land_type={land_type}
                      params={{
                        index: m.index,
                        departement: m.departement,
                      }}
                    />
                  </div>
                ))
            ) : (
              <>
                <div className="fr-col-12 fr-col-lg-6">
                  <OcsgeGraph
                    id="pie_artif_by_couverture"
                    land_id={land_id}
                    land_type={land_type}
                    params={{
                      index: stockIndex,
                    }}
                  />
                </div>
                <div className="fr-col-12 fr-col-lg-6">
                  <OcsgeGraph
                    id="pie_artif_by_usage"
                    land_id={land_id}
                    land_type={land_type}
                    params={{
                      index: stockIndex,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {child_land_types && (
        <div className="fr-mb-7w">
          <h2>Proportion des sols artificialisés</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-8">
              <div className="bg-white fr-p-2w h-100 rounded">
                {child_land_types.length > 1 &&
                  child_land_types.map((child_land_type) => (
                    <button
                      className={`fr-btn  ${
                        childLandType === child_land_type
                          ? "fr-btn--primary"
                          : "fr-btn--tertiary"
                      }`}
                      key={child_land_type}
                      onClick={() => setChildLandType(child_land_type)}
                    >
                      {child_land_type}
                    </button>
                  ))}
                <OcsgeGraph
                  isMap
                  id="artif_map"
                  land_id={land_id}
                  land_type={land_type}
                  containerProps={{
                    style: {
                    height: "500px",
                    width: "100%",
                    }
                  }}
                  params={{
                    index: stockIndex,
                    previous_index: stockIndex - 1,
                    child_land_type: childLandType,
                  }}
                />
              </div>
            </div>
            <div className="fr-col-12 fr-col-lg-4">
              <Guide
                title="Comprendre les données"
                contentHtml={`
                    <p>Cette carte permet de visualiser la proportion de sols artificialisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols artificialisés est élevée.</p>
                    <p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d'artificialisation. La couleur des cercles indique le sens de ce flux : vert pour une désartificialisation nette, rouge pour une artificialisation nette.</p>
                `}
                column
              />
            </div>
          </div>
        </div>
      )}
      <div className="fr-mb-7w">
        <h2>Carte des sols artificialisés</h2>
        <div className="bg-white fr-p-4w rounded">
          <p className="fr-text--sm">
            Cette cartographie permet d'explorer les couvertures et les usages
            des surfaces artificialisées du territoire, en fonction des
            millésimes disponibles de la donnée OCSGE.{" "}
          </p>
          {projectData && (
            <OcsgeMapContainer
              projectData={projectData}
              landData={landData}
              globalFilter={["==", ["get", "is_artificial"], true]}
            />
          )}
        </div>
      </div>
      <div className="bg-white fr-p-4w fr-mb-7w rounded">
        <h6>Calcul de l'artificialisation des sols</h6>
        <p className="fr-text--sm">
          La mesure de l'artificialisation est obtenue à partir de la donnée OCS
          GE, en s'appuyant en particulier sur un tableau de croisement
          couverture / usage. Par exemple, les <u>couvertures</u> de zones bâties à <u>usage</u> résidentiel
          ou les <u>couvertures</u> de formations herbacées à <u>usage</u> tertaire sont considérées comme
          des surfaces artificialisées. L'ensemble des croisements d'usage et de
          couverture du sol définissant les espaces artificialisés est
          consultable dans la matrice OCS GE ci-dessous.
        </p>
        <section className="fr-accordion fr-mb-7w">
          <h3 className="fr-accordion__title">
            <button
              className="fr-accordion__btn"
              aria-expanded="false"
              aria-controls="accordion-106"
            >
              Croisements d'usage et de couverture correspondant à l'artificialisation
            </button>
          </h3>
          <div className="fr-collapse" id="accordion-106">
            <img
              width="100%"
              src="http://localhost:3000/assets/images/fee8522683da78dec22f.png"
            />
          </div>
        </section>
        <p className="fr-text--sm">
          Une fois les espaces qualifiés en artificiels ou non-artificiels à
          partir du tableau de croisement,{" "}
          <strong>des seuils d'interprétation sont appliqués</strong>, comme
          définis dans le{" "}
          <a
            target="_blank"
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol."
          >décret du 27 novembre 2023</a>.
          Ces seuils indiquent que des surfaces de moins de 2500m2 ne peuvent
          pas être comptabilisées comme artificialisées ou désartificialisées, à
          l'exception des espaces bâtis.
        </p>
        <p className="fr-text--sm">
          De fait, l'application de ces seuils{" "}
          <strong>
            permet de densifier en zone construite sans augmenter la mesure de
            l'artificialisation du territoire
          </strong>
          .<br /><br />
          Ci-dessous les trois cas de figure possibles&nbsp;:
        </p>
        <div className="d-flex justify-content-between gap-3 fr-my-7w">
          <SeuilsSchemas />
        </div>
        <p className="fr-text--sm">
          Le détail de la méthode de calcul de l'artificlisation avec les seuils
          d'interprétation est disponibles sur le portail de l'artificialisation
          :&nbsp;{" "}
          <a
            className="fr-link ft-text--sm"
            target="_blank"
            href="https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols"
          >
            https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols
          </a>
        </p>
        <h6>Les exemptions facultatives</h6>
        <p className="fr-text--sm">
          Il est possible pour les collectivités d'ajouter ou de retirer du
          décompte de l'artificialisation les espaces reservés à la production
          photovoltaîques, si leur installation n'affecte pas durablement le
          potentiel agronomique du sol, ainsi que les parcs et jardins publics.
        </p>
        <div className="fr-notice fr-notice--info fr-mb-5w">
          <div className="fr-container">
            <div className="fr-notice__body">
              <p className="fr-text--sm">
                <span className="fr-notice__title">
                  L'IGN est actuellement en train de produire des données france
                  entière sur les parcs photovoltaîques et les parcs et jardins
                  publics.
                </span>
                <a target="_blank" href="/newsletter/inscription">
                    {" "}
                    Inscrivez-vous à la newsletter pour être prévenu(e) de la
                    disponibilité de ces données
                  </a>
              </p>
            </div>
          </div>
        </div>

        <p className="fr-text--sm">
          Vous trouverez ci-dessous le détail des conditions d'exemption
          précises pour chacun des deux cas&nbsp;:
        </p>
        <section className="fr-accordion">
          <h3 className="fr-accordion__title">
            <button
              className="fr-accordion__btn"
              aria-expanded="false"
              aria-controls="accordion-107"
            >
              Conditions d'exemption des installations photovoltaïques et
              agrivoltaïques
            </button>
          </h3>
          <div className="fr-collapse" id="accordion-107">
            <div
              style={{
                backgroundColor: "var(--background-open-blue-france)",
                padding: "15px",
              }}
            >
              <h6>
                Modalités de prise en compte des installations de production
                d’énergie photovoltaïque au sol
              </h6>
              <p>
                Un principe dérogatoire au calcul de la consommation d’espaces
                naturels agricoles et forestiers a été introduit par l'article
                194 de la loi et précisé par le{" "}
                <a
                  href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048736409"
                  target="_blank"
                  title="lien vers le décret"
                >
                  décret n°2023-1408 du 29 décembre 2023
                </a>{" "}
                définissant les modalités de prise en compte des installations
                de production d'énergie photovoltaïque au sol dans le calcul de
                la consommation d'espace. Ce décret définit les critères que
                doivent respecter les installations de production d'énergie
                photovoltaïque pour ne pas être comptabilisées dans le calcul de
                la consommation d'espace (Il définit les modalités de prise en
                compte des installations de production d’énergie photovoltaïque
                au sol dans le calcul de la consommation d’espace).&nbsp;
              </p>
              <p>
                Ce principe dérogatoire a été étendu au calcul de
                l’artificialisation des sols par le &nbsp;
                <a
                  href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959"
                  target="_blank"
                  title="lien vers le décret"
                >
                  décret N° 2023-1096 du 27 novembre 2023
                </a>{" "}
                relatif à l’évaluation et au suivi de l’artificialisation des
                sols, en précisant que, peuvent être considérées comme des
                surfaces non artificialisées, les surfaces sur lesquelles sont
                implantées des installations de production d’énergie solaire
                photovoltaïque qui respectent les critères fixés par le{" "}
                <a
                  href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048736409"
                  target="_blank"
                  title="lien vers le décret"
                >
                  décret n°2023-1408 du 29 décembre 2023
                </a>{" "}
                &nbsp;(définissant les modalités de prise en compte des
                installations de production d'énergie photovoltaïque au sol dans
                le calcul de la consommation d'espace, critères) et précisés par
                l'
                <a
                  href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048736955"
                  target="_blank"
                  title="lien vers l'arrêté"
                >
                  arrêté du 29 décembre 2023
                </a>{" "}
                définissant les caractéristiques techniques des installations de
                production d'énergie photovoltaïque exemptées de prise en compte
                dans le calcul de la consommation d'espace naturels, agricoles
                et forestiers.&nbsp;
              </p>
              <h6>Les installations concernées</h6>
              <p>
                Au sens de la loi, les installations implantées sur les espaces
                agricoles ou naturels peuvent bénéficier de cette dérogation
                relative au calcul de la consommation d'ENAF et également de
                l'artificialisation des sols si d’une part, l’installation
                n’affecte pas durablement les fonctions écologiques du sol ainsi
                que son potentiel agronomique, et si d’autre part, elle n’est
                pas incompatible avec l’exercice d’une activité agricole ou
                pastorale sur le terrain sur lequel elle est implantée. En
                revanche, les installations photovoltaïques implantées sur des
                espaces forestiers ne bénéficient pas de cette dérogation et
                sont donc comptabilisées dans la consommation d’espaces NAF et
                l'artificialisation des sols.
              </p>
              <p>
                L’arrêté du 29 décembre 2023 cité plus haut précise la liste des
                caractéristiques techniques permettant l’atteinte des critères
                afin d’exclure certaines installations du décompte de la
                consommation d’espace et de l'artificialisation des sols. Cet
                arrêté fixe également la liste des données et informations à
                renseigner par les porteurs de projets dans une base de données
                nationale qui servira de référentiel aux autorités en charge de
                l’élaboration des documents d’urbanisme notamment, pour le
                calcul de la consommation d'ENAF de la première tranche de dix
                années (2021 – 2031), et ultérieurement pour le calcul de
                l'artificialisation des sols.
              </p>
              <p>
                Par ailleurs, l'article 7 de l'
                <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049891545">
                  arrêté du 5 juillet 2024
                </a>{" "}
                relatif au développement de l’agrivoltaïsme et aux conditions
                d’implantation des installations photovoltaïques sur terrains
                agricoles, naturels ou forestiers, qui a modifié l'article 1er
                de l'arrêté du 29 décembre, ajoute que les installations
                agrivoltaïques, dès lors qu'elles satisfont aux critères du
                décret n° 2023-1408 du 29 décembre 2023, à savoir ;
                réversibilité de l’installation, maintien du couvert végétal, et
                maintien d’une activité agricole ou pastorale significative,
                pourront ne pas être considérées comme de la consommation d'ENAF
                et donc de l’artificialisation des sols.
              </p>
              <h6>
                Une phase de test sur les Landes progressivement étendue au
                territoire national
              </h6>
              <p>
                Une phase de test sur le département des Landes a visé à
                expérimenter la mise en place d’un guichet collaboratif «
                Démarches simplifiées » de déclaration par les porteurs de
                projet ou les pouvoirs publics des installations de PV au sol, à
                savoir des parcelles foncières concernées et des
                caractéristiques techniques des dites installations. &nbsp;Ces
                déclarations ont été rapprochées des périmètres d'installations
                de PV au sol détectées sur les prises de vues aériennes de
                l'IGN. La phase de test sur le département des Landes étant
                terminée, une bases de données géographique des installations de
                PV au sol, intégrant leur périmètre et le cas échéant des
                données déclaratives, va ainsi être progressivement disponible
                sur le territoire national. Les données déclaratives complétées
                par les porteurs de projet n'y seront accessibles que dès lors
                que les installations de PV au sol auront été effectivement
                constatées sur une prise de vue aérienne IGN.&nbsp;
              </p>

              <h6>Accéder au guichet unique</h6>
              <p>
                &nbsp;Si vous avez sur votre territoire des projets
                photovoltaïques (ou agrivoltaïques) sur des espaces naturels,
                agricoles ou forestiers dont la demande d’autorisation
                d’urbanisme a été déposée ou dont l’autorisation
                &nbsp;d’urbanisme a été délivrée à compter de la date de
                promulgation de la loi 2021-1104 du 22 août 2021, ou, le cas
                échéant, pour des projets dont l’installation est effective à
                compter de cette même date, vous êtes donc &nbsp;invités à les
                déclarer sur le formulaire.
              </p>
              <p>
                <a
                  className="fr-btn"
                  href="https://www.demarches-simplifiees.fr/commencer/declaration_pv_decret2023-1408"
                  target="_blank"
                >
                  Lien vers le formulaire
                </a>
              </p>
              <h6>Rôle du guichet unique</h6>
              <p>
                À défaut de déclaration sur le guichet par les porteurs de
                projet, les espaces occupés par ces installations seront
                comptabilisés dans la consommation d’espaces et de
                l'artificialisation des sols, sauf si l’autorité compétente en
                charge de l’analyse de cette consommation d’espaces, ou de cette
                artificialisation des sols, justifie que ladite installation
                respecte les caractéristiques techniques édictées dans l’arrêté
                du 29 décembre 2023 et procède à l’enregistrement des
                informations requises.
              </p>
              <p>
                La base de données nationale ainsi produite permettra de
                compléter la mesure de l'artificialisation des sols réalisée par
                l'OCS GE.&nbsp;
              </p>
            </div>
          </div>
        </section>
        <section className="fr-accordion">
          <h3 className="fr-accordion__title">
            <button
              className="fr-accordion__btn"
              aria-expanded="false"
              aria-controls="accordion-108"
            >
              Conditions d'exemption des parcs et jardins public
            </button>
          </h3>
          <div className="fr-collapse" id="accordion-108">
            <div
              style={{
                backgroundColor: "var(--background-open-blue-france)",
                padding: "15px",
              }}
            >
              <div>
                <h6>Exemption des parcs et jardins publics</h6>
                <p>
                  Les surfaces végétalisées à usage de parc ou jardin public,
                  quel que soit le type de couvert (boisé ou herbacé) peuvent
                  être considérées comme étant non artificialisées à partir des
                  mêmes seuils de référence applicables (2.500m2) que des
                  surfaces relevant des catégories 9° ou 10° du décret N°
                  2023-1096 du 27 novembre 2023 relatif à l’évaluation et au
                  suivi de l’artificialisation des sols, valorisant ainsi ces
                  espaces de nature en ville.&nbsp;
                </p>
                <p>
                  En 2024, une phase de test sur la région Ile-de-France a visé
                  à expérimenter la mise en place d’un espace collaboratif de
                  déclaration par les pouvoirs publics des parcs et jardins
                  publics. Cette mise en place a ensuite été étendue à
                  l'ensemble du territoire national. Les liens vers les
                  différents guichets régionaux ouverts sont ici
                </p>
                <p>
                  <a
                    className="fr-btn"
                    href="https://espacecollaboratif.ign.fr/"
                    target="_blank"
                  >
                    Lien vers l'espace collaboratif
                  </a>
                </p>
                <p>
                  Une collectivité peut y déclarer des parcs ou jardins publics
                  à tout moment. Pour toute question vous pouvez contacter l'IGN
                  directement par mail à l'adresse suivante :{" "}
                  <a
                    className="fr-link"
                    href="mailto:parcs_jardins_publics@ign.fr"
                    title="mail ign pj"
                  >
                    <strong>parcs_jardins_publics@ign.fr</strong>
                  </a>
                </p>
                <p>
                  À défaut de déclaration sur le guichet par les collectivités,
                  ce sont les données des bases existantes qui seront utilisées
                  pour caractériser les surfaces végétalisées à usage de parc ou
                  jardin public non boisées. Afin de présenter ces guichets, un
                  webinaire a été réalisé le 25 septembre 2024. Cela a été
                  l'occasion de détailler l’outil mis en place. Vous pouvez
                  revoir le webinaire en replay à l'adresse ci dessous.&nbsp;
                </p>
                <p>
                  <a
                    className="fr-btn"
                    href='https://www.youtube.com/watch?v=nuHQtvtgVPY"'
                    target="_blank"
                  >
                    Replay du webinaire
                  </a>
                </p>
                <p>
                  La base de données nationale ainsi produite permettra de
                  compléter la mesure de l'artificialisation des sols réalisée
                  par l'OCSGE.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="fr-mb-7w">
        <h2>Artificialisation des zonages d'urbanisme</h2>
        <div className="bg-white fr-p-4w rounded">
          <p className="fr-text--sm">
            Ce tableau résume le détail de l'artificialisation des zonages
            d'urbanisme présent sur le territoire.
            <br />
            Une carte viendra compléter cette information dans les prochaines
            semaines.
          </p>
          <div className="fr-table fr-mb-0">
            <div className="fr-table__wrapper">
              <div className="fr-table__container">
                <div className="fr-table__content">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Type de zonage</th>
                        <th scope="col">Surface de zonage</th>
                        <th scope="col">Surface artificialisée</th>
                        <th scope="col">Taux d'artificialisation</th>
                        <th scope="col">Nombre de zones</th>
                        <th scope="col">Départements</th>
                        <th scope="col">Années</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artifZonageIndex
                        ?.toSorted(
                          (a, b) => b.zonage_surface - a.zonage_surface
                        )
                        .map((a) => (
                          <tr key={`${a.zonage_type}_${a.millesime_index}`}>
                            <td><b>{ZonageType[a.zonage_type]} ({a.zonage_type})</b></td>
                            <td>{Math.round(a.zonage_surface / 10000)} ha</td>
                            <td>
                              {Math.round(a.artificial_surface / 10000)} ha
                            </td>
                            <td>
                              <div className="progress-bar-container">
                                <div
                                  className={`progress-bar-indicator w-${Math.round(
                                    a.artificial_percent
                                  )}`}
                                ></div>
                                <div className="progress-bar-value">
                                  {formatNumber({
                                    number: a.artificial_percent,
                                  })}
                                  %
                                </div>
                              </div>
                            </td>
                            <td>{a.zonage_count}</td>
                            <td>{a.departements.join(", ")}</td>
                            <td>{a.years.join(", ")}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fr-mb-7w">
        <h2>
          Détail de l'évolution de l'artificialisation des sols du territoire
        </h2>
        <div className="fr-notice fr-notice--warning">
          <div className="fr-container">
            <div className="fr-notice__body">
              <p>
                <span className="fr-notice__title fr-text--sm">
                  Certains indicateurs liés à l'évolution de l'artificialisation
                  d'un millésime à l'autre ne sont pas encore disponibles sur
                  Mon Diagnostic Artificialisation.{" "}
                </span>
                <span className="fr-notice__desc fr-text--sm">
                  En effet, ceux-ci reposent sur des données encore en cours de
                  production. Leur publication est prévue dans les prochaines
                  semaines.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
