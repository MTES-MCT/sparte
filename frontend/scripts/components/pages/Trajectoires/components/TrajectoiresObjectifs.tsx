import React from "react";
import Kpi from "@components/ui/Kpi";
import GuideContent from "@components/ui/GuideContent";
import Timeline from "@components/ui/Timeline";
import Badge from "@components/ui/Badge";
import Button from "@components/ui/Button";
import { TrajectoiresBulletChart } from "./TrajectoiresBulletChart";
import { formatNumber } from "@utils/formatUtils";
import { useTrajectoiresContext } from "../context/TrajectoiresContext";

export const TrajectoiresObjectifs: React.FC = () => {
  const {
    landType,
    name,
    conso2011_2020,
    annualConsoSince2021,
    consoSince2021,
    hasTerritorialisation,
    isFromParent,
    objectifReduction,
    objectifLabel,
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

  const annualConsoReference = conso2011_2020 / 10;

  const referenceContent = (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
        <Kpi
          icon="bi bi-clock-history"
          label="Consommation d'espaces NAF observée"
          value={
            <>
              <div>{formatNumber({ number: conso2011_2020 })} <span>ha</span></div>
              <Badge variant="primary"><strong>{formatNumber({ number: conso2011_2020 / 10 })} ha / an</strong></Badge>
            </>
          }
          variant="default"
          footer={{
            type: "period",
            from: "2011",
            to: "2020",
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GuideContent title="Comprendre la période de référence">
            <p className="fr-text--sm">
              La consommation d'espaces NAF entre 2011 et 2021 constitue
              la base de calcul pour définir la trajectoire de réduction fixée
              par la <strong>loi Climat et Résilience</strong>.
            </p>
            <p className="fr-text--sm fr-mb-0">
              Sur le territoire de <strong>{name}</strong>,{" "}
              <strong>{formatNumber({ number: conso2011_2020 })} ha</strong> ont été
              consommés sur cette période selon les données du Portail National de
              l'artificialisation.{" "}
              Cette valeur sert de point de départ pour apprécier les efforts
              de réduction à mettre en oeuvre sur ce territoire.
            </p>
          </GuideContent>
        </div>
    </div>
  );

  const reductionContent = (
    <>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-8">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6 fr-grid-row">
              <Kpi
                icon="bi bi-bullseye"
                label="Consommation d'espaces NAF à ne pas dépasser"
                value={
                  <>
                    <div>{formatNumber({ number: allowedConso2021_2030 })} <span>ha</span></div>
                    <Badge variant="success"><strong>{formatNumber({ number: allowedConso2021_2030 / 10 })} ha / an</strong></Badge>
                  </>
                }
                variant="success"
                badge={objectifTypeBadge}
                footer={{
                  type: "period",
                  from: "2021",
                  to: "2031",
                }}
              />
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-grid-row">
              <Kpi
                icon="bi bi-sliders"
                label="Consommation d'espaces NAF à ne pas dépasser"
                value={
                  <>
                    <div>
                      {
                        hasCustomTarget ? (
                          <>
                            {formatNumber({ number: allowedConsoCustom })} <span>ha</span>
                          </>
                        ) : "Non défini"
                      }
                    </div>
                    <Badge variant="highlight"><strong>{ hasCustomTarget ? formatNumber({ number: allowedConsoCustom / 10 }) : "-" } ha / an</strong></Badge>
                  </>
                }
                variant="highlight"
                badge={hasCustomTarget ? `Objectif personnalisé (-${targetCustom}%)` : "Objectif personnalisé (non défini)"}
                footer={{
                  type: "period",
                  from: "2021",
                  to: "2031",
                }}
              />
            </div>
          </div>
          <div className="fr-mt-2w">
            <TrajectoiresBulletChart
              referenceValue={annualConsoReference}
              referenceLabel="Rythme 2011-2020"
              currentValue={annualConsoSince2021}
              currentLabel="Rythme actuel 2021-2023"
              markers={[
                { value: allowedConso2021_2030PerYear, label: "Objectif national (-50%)", variant: "target" },
                ...(hasCustomTarget
                  ? [{ value: allowedConsoCustomPerYear, label: `Objectif personnalisé (-${targetCustom}%)`, variant: "custom" as const }]
                  : []),
              ]}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
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
              <strong>Rythme actuel</strong> : entre 2021 et 2023, le territoire a consommé{" "}
              <strong>{formatNumber({ number: consoSince2021 })} ha</strong>, soit un rythme de{" "}
              <strong>{formatNumber({ number: annualConsoSince2021 })} ha/an</strong>.
            </p>
            <p>
              <strong>Objectif personnalisé</strong> : définissez votre propre
              objectif de réduction pour simuler différents scénarios et anticiper
              les besoins du territoire.
            </p>
            <Button variant="primary" onClick={openModal} icon="bi bi-sliders">
              Définir un objectif personnalisé
            </Button>
          </GuideContent>
        </div>
      </div>
    </>
  );

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
      <div className="fr-col-12">
        <Timeline phases={[
            {
              badge: <Badge variant="primary">2011 - 2020</Badge>,
              title: "Période de référence",
              description:
                "La consommation d'espaces NAF de cette décennie sert de base pour calculer l'objectif de réduction.",
              content: referenceContent,
            },
            {
              badge: <Badge variant="primary">2021 - 2031</Badge>,
              title: "Période de réduction",
              description:
                "À l'échelle nationale, l'objectif est de diviser par deux la consommation d'espaces NAF par rapport à la période de référence.",
              content: reductionContent,
            },
          ]}
        />
      </div>
    </div>
  );
};
