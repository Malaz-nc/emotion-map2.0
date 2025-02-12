import * as XLSX from 'xlsx';

interface RawDataRow {
  Article_Date_Published: string;
  Article_Description: string;
  Article_Content_Main_Locations_AI_Model: string;
  Article_Emotion_AI_Model: string;
}

export interface ProcessedLocation {
  lat: number;
  lng: number;
  emotion: string;
  emotionPercentage: string;
  intensity: string;
  description: string;
  date: Date;
  country: string;
}

export const processExcelData = (file: File): Promise<ProcessedLocation[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: RawDataRow[] = XLSX.utils.sheet_to_json(firstSheet);
        
        const processedData = jsonData
          .map(row => {
            try {
              // Extract location and country
              const locationMatch = row.Article_Content_Main_Locations_AI_Model.match(
                /Latitude:([-\d.]+)\|\|Longitude:([-\d.]+)/
              );
              
              const countryMatch = row.Article_Content_Main_Locations_AI_Model.match(
                /Country: ([^|Latitude]+)/
              );
              
              // Extract emotion with percentage
              const emotionMatch = row.Article_Emotion_AI_Model.match(
                /Primary: (\w+)\|(\d+)%.*Intensity: (\w+)/
              );
              
              if (!locationMatch || !emotionMatch || !countryMatch) {
                console.error('Failed to match patterns:', {
                  location: locationMatch,
                  emotion: emotionMatch,
                  country: countryMatch,
                  rawData: {
                    location: row.Article_Content_Main_Locations_AI_Model,
                    emotion: row.Article_Emotion_AI_Model
                  }
                });
                return null;
              }
              
              return {
                lat: parseFloat(locationMatch[1]),
                lng: parseFloat(locationMatch[2]),
                emotion: emotionMatch[1],
                emotionPercentage: emotionMatch[2],
                intensity: emotionMatch[3],
                description: row.Article_Description,
                date: new Date(row.Article_Date_Published),
                country: countryMatch[1].trim()
              };
            } catch (error) {
              console.error('Error processing row:', error);
              return null;
            }
          })
          .filter((item): item is ProcessedLocation => item !== null);
        
        // Log success message with sample data
        if (processedData.length > 0) {
          console.log('Successfully processed data sample:', processedData[0]);
        }
        
        resolve(processedData);
      } catch (error) {
        console.error('Error processing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};