import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import formatNumber from '../../utils/formatUtils';

const Overview: React.FC = () => {
  const projectData = useSelector((state: RootState) => state.project.projectData);

  if (!projectData) return <div>No project data available.</div>;

  return (
    <div className="fr-mb-3w">
        <h1>{ projectData.territory_name }</h1>
        <ul className="fr-tags-group">
            <li>
                <p className="fr-tag">Surface du territoire:&nbsp;<strong>{ formatNumber(projectData.area, 0) } ha</strong></p>
            </li>
            <li>
                <a href="#" data-bs-toggle="modal" data-bs-target="#fr-modal-update-period" className="fr-tag" hx-get="{% url 'project:set-period' project.pk %}" hx-target="#update_period_form">Période demandée:&nbsp;<strong>De { projectData.analyse_start_date } à { projectData.analyse_end_date }</strong><span className="fr-icon-pencil-fill fr-icon--sm custom-tag-icon" aria-hidden="true"></span></a>
            </li>
            <li>
                <p className="fr-tag">Maille d'analyse:&nbsp;<strong>{ projectData.level_label }</strong></p>
            </li>
        </ul>
    </div>
  );
};

export default Overview;