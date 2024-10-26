export type NodeType = {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    type: 'default' | 'start' | 'end' | 'special';
    label?: string;
    data?: Record<string, any>;
    physics: PhysicsState;
    isNew?: boolean; // For animation
    isDeleting?: boolean; // For animation
};

export type Annotation = {
    id: string;
    text: string;
    x: number;
    y: number;
    color?: string;
};

export type EdgeType = {
    id: string;
    from: string;
    to: string;
    color?: string;
    weight?: number;
    length?: number; // Desired length for physics
};

export type Transform = {
    x: number;
    y: number;
    scale: number;
};

export type EditorMode = 'select' | 'add' | 'delete' | 'draw' | 'annotate';

export type Point = {
    x: number;
    y: number;
};

export type PhysicsState = {
    velocity: Point;
    force: Point;
};

export type EditorState = {
    nodes: NodeType[];
    edges: EdgeType[];
    annotations: Annotation[];
}