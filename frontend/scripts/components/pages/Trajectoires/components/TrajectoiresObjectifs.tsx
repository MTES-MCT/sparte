import React from "react";
import Kpi from "@components/ui/Kpi";
import GuideContent from "@components/ui/GuideContent";
import Timeline from "@components/ui/Timeline";
import Badge from "@components/ui/Badge";
import { formatNumber } from "@utils/formatUtils";
import { useTrajectoiresContext } from "../context/TrajectoiresContext";

export const TrajectoiresObjectifs: React.FC = () => {
  const {
    landType,
    name,
    conso2011_2020,
    annualConsoSince2021,
    hasTerritorialisation,
    isFromParent,
    objectifReduction,
    objectifLabel,
    objectifType,
    objectifTypeBadge,
    allowedConso2021_2030,
    allowedConso2021_2030PerYear,
    targetCustom,
    hasCustomTarget,
    allowedConsoCustom,
    allowedConsoCustomPerYear,
    sourceDocument,
    currentDocument,
    parentDocument,
    openModal,
  } = useTrajectoiresContext();

  const referenceContent = (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
        <Kpi
          icon="bi bi-clock-history"
          label="Consommation cumulée de la période du 1er janvier 2011 au 31 décembre 2020 (10 ans)"
          description={`${formatNumber({ number: conso2011_2020 / 10 })} ha par an`}
          value={
            <>
              {formatNumber({ number: conso2011_2020 })} <span>ha</span>
            </>
          }
          variant="default"
          footer={{
            type: "period",
            periods: [
              { label: "2011", active: true },
              { label: "2020" },
            ],
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
      <GuideContent title="Comprendre la période de référence">
          <p>
            <strong>La période de référence</strong> sert de base pour mesurer la consommation d’espaces NAF (Naturels, Agricoles et Forestiers), afin de fixer les objectifs de réduction d’ici 2031.
          </p>
          <p>
            <strong>Elle s'étale de 2011 à 2020, soit 10 ans.</strong> L’objectif est de réduire de moitié cette consommation d’ici 2031 par rapport à ce qui a été consommé durant cette période.
          </p>
        </GuideContent>
      </div>
    </div>
  );

  const reductionContent = (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
        <Kpi
          icon="bi bi-bullseye"
          label={`${objectifLabel} (-${objectifReduction}%)`}
          description="Consommation maximale pour la période du 1er janvier 2021 au 31 décembre 2030 (10 ans)"
          value={
            <>
              {formatNumber({ number: allowedConso2021_2030 })} <span>ha</span>
            </>
          }
          variant={hasTerritorialisation ? "default" : "success"}
          badge={objectifTypeBadge}
          footer={{
            type: "minichart",
            unit: "ha",
            bars: [
              {
                label: "Consommation annuelle moyenne (depuis 2021)",
                value: annualConsoSince2021,
              },
              {
                label: `Consommation annuelle moyenne autorisée selon l'objectif (${objectifType})`,
                value: allowedConso2021_2030PerYear,
              },
            ],
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-md-4 fr-grid-row">
        <Kpi
          icon="bi bi-sliders"
          label={hasCustomTarget ? `Objectif personnalisé (-${targetCustom}%)` : "Objectif personnalisé"}
          description="Consommation maximale pour la période du 1er janvier 2021 au 31 décembre 2030 (10 ans)"
          value={
            hasCustomTarget ? (
              <>
                {formatNumber({ number: allowedConsoCustom })} <span>ha</span>
              </>
            ) : "_"
          }
          variant="default"
          badge="Objectif personnalisé"
          action={{
            label: "Définir un objectif personnalisé",
            onClick: openModal,
          }}
          footer={{
            type: "minichart",
            unit: "ha",
            bars: [
              {
                label: "Consommation annuelle moyenne (depuis 2021)",
                value: annualConsoSince2021,
              },
              {
                label: "Consommation autorisée (personnalisé)",
                value: hasCustomTarget ? allowedConsoCustomPerYear : null,
              },
            ],
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
        <GuideContent title="Comprendre l'objectif de réduction">
          <p>
            <strong>{objectifLabel}</strong> : c'est le maximum d'espaces que le
            territoire peut consommer entre 2021 et 2030. Il est calculé en
            appliquant une réduction de <strong>{objectifReduction}%</strong> à
            la consommation de référence (2011-2020).
          </p>
          {hasTerritorialisation && !isFromParent && (
            <p>
              Cet objectif est issu du{" "}
              {sourceDocument ? (
                parentDocument?.document_url ? (
                  <a
                    href={parentDocument.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sourceDocument.nom_document}
                  </a>
                ) : (
                  sourceDocument.nom_document
                )
              ) : currentDocument ? (
                currentDocument.document_url ? (
                  <a
                    href={currentDocument.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {currentDocument.nom_document}
                  </a>
                ) : (
                  currentDocument.nom_document
                )
              ) : null}
              {landType !== "REGION" &&
                " et doit être inscrit dans vos documents d'urbanisme"}
              .
            </p>
          )}
          {hasTerritorialisation && isFromParent && (
            <p>
              Cet objectif reprend celui de l'échelon supérieur, car {name} ne
              dispose pas encore d'un objectif territorialisé propre. Il est
              fourni à titre indicatif et n'a donc pas de valeur réglementaire.
            </p>
          )}
          {!hasTerritorialisation && (
            <p>
              En l'absence d'objectif territorialisé, la trajectoire nationale
              de <strong>-50%</strong> s'applique par défaut. Les documents de
              planification (SRADDET, SCoT, PLU) pourront définir un objectif
              spécifique.
            </p>
          )}
          <p>
            <strong>Objectif personnalisé</strong> : définissez votre propre
            objectif de réduction pour simuler différents scénarios et anticiper
            les besoins du territoire.
          </p>
        </GuideContent>
      </div>
    </div>
  );

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
      <div className="fr-col-12">
        <Timeline phases={[
            {
              badge: <Badge variant="highlight">2011 - 2020</Badge>,
              title: "Période de référence",
              content: referenceContent,
            },
            {
              badge: <Badge variant="highlight">2021 - 2031</Badge>,
              title: "Période de réduction",
              content: reductionContent,
            },
          ]}
        />
      </div>
    </div>
  );
};
