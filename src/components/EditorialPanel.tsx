import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, MousePointer } from 'lucide-react';
import type { EditorMode } from '@/lib/types';

type EditorialPanelProps = {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;
};

// Mode selection buttons component
const EditorialPanel: React.FC<EditorialPanelProps> = ({ mode, setMode }) => {
    return (
        <Card className="w-48 p-4 space-y-2">
            <Button
                variant={mode === 'select' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setMode('select')}
            >
                <MousePointer className="w-4 h-4 mr-2" />
                Select
            </Button>
            <Button
                variant={mode === 'add' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setMode('add')}
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Nodes
            </Button>
            <Button
                variant={mode === 'delete' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setMode('delete')}
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
            </Button>
            <Button
                variant={mode === 'draw' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setMode('draw')}
            >
                <Pencil className="w-4 h-4 mr-2" />
                Draw
            </Button>
        </Card>
    );
};

export default EditorialPanel;