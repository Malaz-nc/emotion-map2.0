import React, { useState } from 'react';
import { processExcelData } from '../utils/dataProcessing';
import type { ProcessedLocation } from '../utils/dataProcessing';

interface FileUploadProps {
  onDataProcessed: (data: ProcessedLocation[]) => void;
}

const FileUpload = ({ onDataProcessed }: FileUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await processExcelData(file);
      onDataProcessed(data);
    } catch (err) {
      setError('Error processing file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '4px' }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: loading ? 'none' : 'block' }}
      />
      {loading && <div>Processing...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default FileUpload;