import React from 'react';
import ClientRequestsHub from './ClientRequestsHub';

interface RichiesteProps {
  prefilledData?: any;
  onDataUsed?: () => void;
}

const Richieste: React.FC<RichiesteProps> = ({
  prefilledData,
  onDataUsed
}) => {
  return (
    <ClientRequestsHub 
      prefilledData={prefilledData}
      onDataUsed={onDataUsed}
    />
  );
};

export default Richieste;