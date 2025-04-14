import React, { useId} from 'react';


export const Chartsource = () => {
    const targetId = useId();
    return (
        <div className="fr-notice bg-white fr-mt-2w fr-mb-2w">
        <div className="fr-px-2w">
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <span className="fr-icon-information-line" aria-hidden="true"></span>
                    <span className="fr-text--xs fr-mr-1w">Source de données: </span>
                    <p className="fr-tag fr-tag--sm fr-tag--blue">
                        <strong>FICHIERS FONCIERS</strong>
                    </p>
                </div>
                <button className="fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-right fr-icon-arrow-down-s-fill mt-0" aria-expanded="false" aria-controls={targetId} data-fr-js-collapse-button="true">Détails données et calcul</button>
            </div>
            <div className="fr-collapse" id={targetId} data-fr-js-collapse="true">
                <h6 className="fr-mt-2w">Source</h6>
                <p className="fr-text--sm">
    Données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à 
    partir des fichiers MAJIC (Mise A Jour de l'Information Cadastrale) de la DGFIP. Le dernier 
    millésime de 2023 est la photographie du territoire au 1er janvier 2023, intégrant les évolutions 
    réalisées au cours de l'année 2022.
    Pour plus d'informations sur <a className="fr-link" href="https://faq.mondiagartif.beta.gouv.fr/fr/article/quest-ce-quun-millesime-110ihlr/" target="_blank" rel="noopener noreferrer">"Qu'est-ce qu'un millésime ?"</a>.
</p>

                <h6 className="fr-mt-2w">Calcul</h6>
                <p className="fr-text--sm">Données brutes, sans calcul</p>

                <h6 className="fr-mt-2w">Données</h6>
                <div className="fr-table fr-table--bg-whiteed" data-fr-js-table="true" style={{"--table-offset": 0} as any}>
                    <div className="fr-table__wrapper" data-fr-js-table-wrapper="true" style={{"--table-offset": "calc(80px + 1rem)"} as any}>
                        <div className="fr-table__container">
                            <div className="fr-table__content">
                                <table className="table-last-column-bold table-last-row-bold" data-fr-js-table-element="true">
                                    <caption data-fr-js-table-caption="true">
                                        Consommation d'espaces NAF annuelle sur le territoire (en ha)
                                    </caption>
                                    <thead>
                                        <tr>
                                            <th scope="col" className="fr-cell--fixed"></th>
                                            
                                            <th scope="col" className="fr-cell--right">2011</th>
                                            
                                            <th scope="col" className="fr-cell--right">2012</th>
                                            
                                            <th scope="col" className="fr-cell--right">2013</th>
                                            
                                            <th scope="col" className="fr-cell--right">2014</th>
                                            
                                            <th scope="col" className="fr-cell--right">2015</th>
                                            
                                            <th scope="col" className="fr-cell--right">2016</th>
                                            
                                            <th scope="col" className="fr-cell--right">2017</th>
                                            
                                            <th scope="col" className="fr-cell--right">2018</th>
                                            
                                            <th scope="col" className="fr-cell--right">2019</th>
                                            
                                            <th scope="col" className="fr-cell--right">2020</th>
                                            
                                            <th scope="col" className="fr-cell--right">2021</th>
                                            
                                            <th scope="col" className="fr-cell--right">2022</th>
                                            
                                            <th scope="col" className="fr-cell--right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                        <tr data-fr-js-table-row="true">
                                            <th scope="row" className="fr-cell--fixed">Augan</th>
                                            
                                            <td className="fr-cell--right">+0,8</td>
                                            
                                            <td className="fr-cell--right">+0,6</td>
                                            
                                            <td className="fr-cell--right">+0,2</td>
                                            
                                            <td className="fr-cell--right">+0,6</td>
                                            
                                            <td className="fr-cell--right">+0,6</td>
                                            
                                            <td className="fr-cell--right">+0,4</td>
                                            
                                            <td className="fr-cell--right">+0,3</td>
                                            
                                            <td className="fr-cell--right">+1,0</td>
                                            
                                            <td className="fr-cell--right">+0,3</td>
                                            
                                            <td className="fr-cell--right">+0,9</td>
                                            
                                            <td className="fr-cell--right">+1,2</td>
                                            
                                            <td className="fr-cell--right">+0,4</td>
                                            
                                            <td className="fr-cell--right">+7,3</td>
                                            
                                        </tr>
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}