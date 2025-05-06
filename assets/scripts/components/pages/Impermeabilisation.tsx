import React from 'react';
import Guide from '@components/ui/Guide';

export const Impermeabilisation = () => {
    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide
                        title="Cadre réglementaire"
                        contentHtml={`L’imperméabilisation des sols est définie comme: 
                            <ul>
                                <li>1° Surfaces dont les sols sont imperméabilisés en raison du bâti (constructions, aménagements, ouvrages ou installations).</li>
                                <li>2° Surfaces dont les sols sont imperméabilisés en raison d'un revêtement (Impericiel, asphalté, bétonné, couvert de pavés ou de dalles).</li>
                            </ul>
                        `}
                        DrawerTitle="Cadre Réglementaire"
                        DrawerContentHtml={`
                            <p class="fr-text--sm mb-3">Le <a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959">Décret n° 2023-1096 du 27 novembre 2023 relatif à l'évaluation et au suivi de l'Imperméabilisation des sols</a> précise que le rapport relatif à l'Imperméabilisation des sols prévu à l'article L. 2231-1 présente, pour les années civiles sur lesquelles il porte et au moins tous les trois ans, les indicateurs et données suivants:</p>
                            <ul class="fr-text--sm mb-3">
                                <li>« 1° La consommation des espaces naturels, agricoles et forestiers, exprimée en nombre d'hectares, le cas échéant en la différenciant entre ces types d'espaces, et en pourcentage au regard de la superficie du territoire couvert. Sur le même territoire, le rapport peut préciser également la transformation effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d'une désimperméabilisation ;</li>
                                <li>« 2° Le solde entre les surfaces imperméabilisées et les surfaces désimperméabilisées, telles que définies dans la nomenclature annexée à l'<a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">article R. 101-1 du code de l'urbanisme</a> ;</li>
                                <li>« 3° Les surfaces dont les sols ont été rendus imperméables, au sens des 1° et 2° de la nomenclature annexée à l'<a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">article R. 101-1 du code de l'urbanisme</a> ;</li>
                                <li>« 4° L'évaluation du respect des objectifs de réduction de la consommation d'espaces naturels, agricoles et forestiers et de lutte contre l'imperméabilisation des sols fixés dans les documents de planification et d'urbanisme. Les documents de planification sont ceux énumérés au <a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">III de l'article R. 101-1 du code de l'urbanisme</a>.</li>
                            </ul>
                            <p class="fr-text--sm mb-3">
                                L’imperméabilisation des sols est donc définie comme:
                            </p>
                            <ul class="fr-text--sm mb-3">
                                <li>1° Surfaces dont les sols sont imperméabilisés en raison du bâti (constructions, aménagements, ouvrages ou installations).</li>
                                <li>2° Surfaces dont les sols sont imperméabilisés en raison d'un revêtement (Impericiel, asphalté, bétonné, couvert de pavés ou de dalles).</li>
                            </ul>
                            <p class="fr-text--sm mb-3">
                                Au niveau national, l’imperméabilisation est mesurée par l'occupation des sols à grande échelle (OCS GE), en cours d'élaboration, dont la production sera engagée sur l'ensemble du territoire national d'ici mi 2025.
                            </p>
                            <p class="fr-text--sm mb-3">
                                Dans la nomenclature OCS GE, les zones imperméables correspondent aux deux classes commençant par le code CS1.1.1
                            </p>
                        `}
                    />
                </div>
            </div>
        </div>
    );
};

