import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    mermaid: any;
  }
}

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !window.mermaid) return;

      try {
        window.mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif'
        });
        
        const id = `mermaid-${Date.now()}`;
        const { svg: renderedSvg } = await window.mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. The syntax might be invalid.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) return <div className="text-red-500 text-sm p-4 bg-red-50 rounded border border-red-100">{error}</div>;

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto p-4 flex justify-center bg-white rounded-lg"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default MermaidChart;