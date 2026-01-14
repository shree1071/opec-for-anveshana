import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Card } from './ui/Card';

export function CareerFlowchart({ flowchartSyntax }) {
    const mermaidRef = useRef(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });

        if (mermaidRef.current && flowchartSyntax) {
            mermaidRef.current.removeAttribute('data-processed');
            mermaid.contentLoaded();
        }
    }, [flowchartSyntax]);

    if (!flowchartSyntax) {
        return null;
    }

    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Your Career Journey Visualized</h3>
            <div className="bg-slate-50 p-6 rounded-lg overflow-x-auto">
                <div ref={mermaidRef} className="mermaid">
                    {flowchartSyntax}
                </div>
            </div>
        </Card>
    );
}
