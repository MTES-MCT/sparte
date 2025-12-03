import styled from "styled-components";

export const SectionContainer = styled.section`
  margin-bottom: 3rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000091;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #000091;
`;

export const SubTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #000091;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

export const SubSubTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

export const ChartContainer = styled.div`
  margin: 2rem 0;
  background: white;
  padding: 1rem;
  border-radius: 8px;

  @media print {
    background: transparent;
    padding: 0;
    page-break-inside: avoid;
  }
`;

export const DataTableContainer = styled.div`
  margin: 1.5rem 0;
`;

export const InfoBox = styled.div`
  background: #fff8e6;
  border-left: 4px solid #ffc107;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;

  h3, h4 {
    margin-top: 0;
    font-size: 0.95rem;
    color: #d68000;
  }

  p {
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    margin-bottom: 1rem !important;
    text-align: left !important;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    font-size: 0.8rem;
  }
`;

export const HighlightBox = styled.div`
  background: #f0f0ff;
  border-left: 4px solid #000091;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;

  h3, h4 {
    margin-top: 0;
    font-size: 0.95rem;
    color: #000091;
  }

  p {
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    margin-bottom: 0.5rem !important;
    text-align: left !important;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    font-size: 0.8rem;
  }
`;

export const NoteBox = styled.div`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1565c0;
  }

  p {
    margin: 0 !important;
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    text-align: left !important;
  }
`;

export const KeyPointsBox = styled.div`
  background: #f0f8ff;
  border-left: 4px solid #2196f3;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    color: #1565c0;
  }

  ul {
    margin: 1rem 0 0 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
    font-size: 0.8rem;
  }
`;

export const IntroBox = styled.div`
  background: #e8f4f8;
  border-left: 4px solid #0078f3;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border-radius: 4px;

  p {
    margin: 0 !important;
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    text-align: left !important;
  }
`;

export const SimulationBox = styled.div`
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;

  h3 {
    margin-top: 0;
    font-size: 0.95rem;
    color: #2e7d32;
  }

  p {
    margin-bottom: 0.5rem !important;
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    text-align: left !important;
  }
`;

export const QuoteBox = styled.div`
  background: #f6f6f6;
  border-left: 4px solid #666;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;
  font-style: italic;

  p {
    margin-bottom: 1rem !important;
    font-size: 0.8rem !important;
    color: #333 !important;
    line-height: 1.6 !important;
    text-align: left !important;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    list-style: none;
  }

  li {
    margin-bottom: 1rem;
    line-height: 1.6;
    position: relative;
    padding-left: 0.5rem;
    font-size: 0.8rem;
  }
`;
