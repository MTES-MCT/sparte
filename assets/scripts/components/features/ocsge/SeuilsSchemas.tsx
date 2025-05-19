import React from "react";
import styled from "styled-components";

export const artifColor = "#F4D0C4";
export const nonArtifColor = "#CDE3CE";
export const nonArtifDarkColor = "#486B5D";

export const SquareBase = styled.div`
	width: 130px;
	height: 130px;
	position: relative;

	@keyframes blinkRed {
		0% {
			background-color: ${artifColor};
		}
		50% {
			background-color: #edb2a1;
		}
		100% {
			background-color: ${artifColor};
		}
	}

	@keyframes blinkGreen {
		0% {
			background-color: ${nonArtifColor};
		}
		50% {
			background-color: #b8d7b9;
		}
		100% {
			background-color: ${nonArtifColor};
		}
	}
`;

export const ArtificializedSquare = styled(SquareBase)`
	background-color: ${artifColor};

	&::after {
		content: "< 2500m²";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 66.67%;
		height: 66.67%;
		border: 1px solid ${nonArtifDarkColor};
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75em;
		color: ${nonArtifDarkColor};
	}

	&.without-threshold::after {
		background-color: ${nonArtifColor};
	}

	&.with-threshold::after {
		animation: blinkRed 1s infinite;
	}
`;

export const NonArtificializedSquare = styled(SquareBase)`
	background-color: ${nonArtifColor};

	&::after {
		content: "< 2500m²";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 66.67%;
		height: 66.67%;
		border: 1px solid ${nonArtifDarkColor};
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75em;
		color: ${nonArtifDarkColor};
	}

	&.without-threshold::after {
		background-color: ${artifColor};
	}

	&.with-threshold::after {
		animation: blinkGreen 1s infinite;
	}
`;

export const ConstructionSquare = styled(SquareBase)`
	background-color: ${nonArtifColor};

	&::after {
		content: "> 50m²";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 35%;
		height: 35%;
		border: 1px solid ${nonArtifDarkColor};
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.65em;
		color: ${nonArtifDarkColor};
	}

	&.without-threshold::after {
		background-color: ${artifColor};
	}

	&.with-threshold::after {
		animation: blinkRed 1s infinite;
	}
`;

const SchemaPair = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 1rem;
	margin-bottom: 2rem;
`;

const Arrow = styled.div`
	font-size: 1rem;
	display: flex;
	align-items: center;
	&::after {
		content: "→";
	}
`;

export const SeuilsSchemas = () => {
	return (
		<div className="fr-grid-row fr-grid-row--gutters">
			<SchemaPair className="fr-col-12 fr-col-lg-4">
				<span className="fr-badge">1</span>
				<div className="d-flex align-items-center gap-2">
					<ArtificializedSquare className="without-threshold" />
					<Arrow />
					<ArtificializedSquare className="with-threshold" />
				</div>
				<p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
					Une zone non-artificielle de moins de 2500 m² enclavée dans une zone
					artificielle devient artificielle.
				</p>
			</SchemaPair>

			<SchemaPair className="fr-col-12 fr-col-lg-4">
				<span className="fr-badge">2</span>
				<div className="d-flex align-items-center gap-2">
					<NonArtificializedSquare className="without-threshold" />
					<Arrow />
					<NonArtificializedSquare className="with-threshold" />
				</div>
				<p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
					Une zone artificielle de moins de 2500 m² enclavée dans une zone
					non-artificielle devient non-artificielle.
				</p>
			</SchemaPair>

			<SchemaPair className="fr-col-12 fr-col-lg-4">
				<span className="fr-badge">3</span>
				<div className="d-flex align-items-center gap-2">
					<ConstructionSquare className="without-threshold" />
					<Arrow />
					<ConstructionSquare className="with-threshold" />
				</div>
				<p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
					Une zone bâtie de plus de 50 m² enclavée dans une zone
					non-artificielle est toujours artificielle.
				</p>
			</SchemaPair>
		</div>
	);
};
