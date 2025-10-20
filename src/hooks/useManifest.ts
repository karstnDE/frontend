import { useState, useEffect } from 'react';

export function useManifest(): string {
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    fetch('/data/_manifest.json')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.generated_at) {
          const date = new Date(data.generated_at);
          // Format as YYYY-MM-DD only (date without time)
          const formatted = date.toISOString().slice(0, 10);
          setTimestamp(formatted);
        }
      })
      .catch((error) => {
        console.warn('Failed to load manifest:', error);
        setTimestamp('');
      });
  }, []);

  return timestamp;
}
