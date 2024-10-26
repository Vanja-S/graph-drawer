import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { NodeType } from '@/lib/types';

type NodeEditorProps = {
    selectedNodes: NodeType[];
    updateNodes: (nodes: NodeType[]) => void;
};

// Node properties editor component
const NodeEditor: React.FC<NodeEditorProps> = ({ selectedNodes, updateNodes }) => {
    if (selectedNodes.length === 0) return null;

    const handleColorChange = (color: string) => {
        updateNodes(selectedNodes.map(node => ({ ...node, color })));
    };

    const handleSizeChange = (size: number) => {
        updateNodes(selectedNodes.map(node => ({ ...node, radius: size })));
    };

    const handleTypeChange = (type: NodeType['type']) => {
        updateNodes(selectedNodes.map(node => ({ ...node, type })));
    };

    return (
        <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-96">
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    <div className="font-medium">Size</div>
                    <Slider
                        defaultValue={[selectedNodes[0]?.radius || 20]}
                        min={10}
                        max={40}
                        step={1}
                        onValueChange={([value]) => handleSizeChange(value)}
                    />
                </div>
                <div className="space-y-2">
                    <div className="font-medium">Color</div>
                    <div className="flex gap-2">
                        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                            />
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="font-medium">Type</div>
                    <div className="flex gap-2">
                        {(['default', 'start', 'end', 'special'] as const).map((type) => (
                            <Button
                                key={type}
                                variant={selectedNodes[0]?.type === type ? 'default' : 'outline'}
                                onClick={() => handleTypeChange(type)}
                                className="capitalize"
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NodeEditor;