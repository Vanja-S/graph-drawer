"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, MousePointer, Type, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhysics } from '../../hooks/usePhysics';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import type { Transform, NodeType, EditorMode, Point, Annotation, EdgeType, } from '@/lib/types';

const GraphWhiteboard: React.FC = () => {
    const { state, pushState, undo, redo, canUndo, canRedo } = useUndoRedo({
        nodes: [],
        edges: [],
        annotations: []
    });


    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [mode, setMode] = useState<EditorMode>('select');
    const [selectedNodes, setSelectedNodes] = useState<NodeType[]>([]);
    const [draggingFrom, setDraggingFrom] = useState<NodeType | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [annotationText, setAnnotationText] = useState('');

    // Use physics simulation
    usePhysics(state.nodes, state.edges, (nodes) => {
        pushState({ ...state, nodes });
    });

    const getTransformedPoint = useCallback((e: React.MouseEvent<SVGSVGElement>): Point => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        return {
            x: (svgP.x - transform.x) / transform.scale,
            y: (svgP.y - transform.y) / transform.scale
        };
    }, [transform]);


    // Add node with animation
    const addNode = useCallback((point: Point) => {
        const newNode: NodeType = {
            id: `node-${Date.now()}`,
            x: point.x,
            y: point.y,
            radius: 20,
            color: '#000000',
            type: 'default',
            isNew: true,
            physics: {
                velocity: { x: 0, y: 0 },
                force: { x: 0, y: 0 }
            }
        };

        pushState({
            ...state,
            nodes: [...state.nodes, newNode]
        });

        // Remove isNew flag after animation
        setTimeout(() => {
            pushState({
                ...state,
                nodes: state.nodes.map(n =>
                    n.id === newNode.id ? { ...n, isNew: false } : n
                )
            });
        }, 300);
    }, [state, pushState]);

    // Delete node with animation
    const deleteNode = useCallback((nodeId: string) => {
        pushState({
            ...state,
            nodes: state.nodes.map(n =>
                n.id === nodeId ? { ...n, isDeleting: true } : n
            )
        });

        setTimeout(() => {
            pushState({
                ...state,
                nodes: state.nodes.filter(n => n.id !== nodeId),
                edges: state.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
            });
        }, 300);
    }, [state, pushState]);

    // Add annotation
    const addAnnotation = useCallback((point: Point) => {
        if (!annotationText) return;

        const newAnnotation: Annotation = {
            id: `annotation-${Date.now()}`,
            text: annotationText,
            x: point.x,
            y: point.y,
            color: '#000000'
        };

        pushState({
            ...state,
            annotations: [...state.annotations, newAnnotation]
        });

        setAnnotationText('');
    }, [state, annotationText, pushState]);

    // Zoom and pan handlers
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setTransform(prev => ({
                ...prev,
                scale: Math.max(0.1, Math.min(4, prev.scale * delta))
            }));
        } else {
            setTransform(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button === 1) { // Middle mouse button
            setIsPanning(true);
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning) {
            setTransform(prev => ({
                ...prev,
                x: prev.x + e.movementX,
                y: prev.y + e.movementY
            }));
        }

        const point = getTransformedPoint(e);
        setMousePosition(point);
    }, [isPanning, getTransformedPoint]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning) return;

        const point = getTransformedPoint(e);
        const clickedNode = state.nodes.find(node => {
            const dx = node.x - point.x;
            const dy = node.y - point.y;
            return Math.sqrt(dx * dx + dy * dy) < node.radius;
        });

        switch (mode) {
            case 'select':
                if (clickedNode) {
                    setSelectedNodes(prev =>
                        e.shiftKey ? [...prev, clickedNode] : [clickedNode]
                    );
                } else {
                    setSelectedNodes([]);
                }
                break;

            case 'add':
                if (!clickedNode) {
                    addNode(point);
                }
                break;

            case 'delete':
                if (clickedNode) {
                    deleteNode(clickedNode.id);
                }
                break;

            case 'draw':
                if (clickedNode) {
                    if (!draggingFrom) {
                        setDraggingFrom(clickedNode);
                    } else if (clickedNode.id !== draggingFrom.id) {
                        // Add edge
                        const newEdge: EdgeType = {
                            id: `edge-${Date.now()}`,
                            from: draggingFrom.id,
                            to: clickedNode.id,
                            length: 100 // Default length for physics
                        };
                        pushState({
                            ...state,
                            edges: [...state.edges, newEdge]
                        });
                        setDraggingFrom(null);
                    }
                }
                break;

            case 'annotate':
                if (!clickedNode) {
                    addAnnotation(point);
                }
                break;
        }
    }, [mode, state, isPanning, draggingFrom, addNode, deleteNode, addAnnotation, getTransformedPoint, pushState]);

    return (
        <div className="flex gap-4 p-4 h-screen">
            {/* Control Panel */}
            <Card className="w-48 space-y-4 pt-6">
                {/* Mode buttons */}
                <CardContent className="space-y-2">
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
                        Add Node
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
                        Draw Edge
                    </Button>
                    <Button
                        variant={mode === 'annotate' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setMode('annotate')}
                    >
                        <Type className="w-4 h-4 mr-2" />
                        Annotate
                    </Button>
                </CardContent>

                {/* Undo/Redo */}
                <CardContent className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={undo}
                        disabled={!canUndo}
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={redo}
                        disabled={!canRedo}
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </CardContent>

                {/* Zoom controls */}
                <CardContent className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setTransform(prev => ({
                            ...prev,
                            scale: prev.scale * 0.9
                        }))}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setTransform(prev => ({
                            ...prev,
                            scale: prev.scale * 1.1
                        }))}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </CardContent>

                {/* Annotation input */}
                {mode === 'annotate' && (
                    <CardContent>
                        <input
                            type="text"
                            value={annotationText}
                            onChange={(e) => setAnnotationText(e.target.value)}
                            placeholder="Enter annotation..."
                            className="w-full p-2 border rounded"
                        />
                    </CardContent>
                )}
            </Card>

            {/* Main SVG Canvas */}
            <Card className="flex-1">
                <svg
                    className="w-full h-full bg-gray-100"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={handleClick}
                >
                    <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                        {/* Edges */}
                        {state.edges.map(edge => {
                            const fromNode = state.nodes.find(n => n.id === edge.from);
                            const toNode = state.nodes.find(n => n.id === edge.to);
                            if (!fromNode || !toNode) return null;
                            return (
                                <line
                                    key={edge.id}
                                    x1={fromNode.x}
                                    y1={fromNode.y}
                                    x2={toNode.x}
                                    y2={toNode.y}
                                    stroke="black"
                                    strokeWidth={2 / transform.scale}
                                />
                            );
                        })}

                        {/* Nodes with animations */}
                        <AnimatePresence>
                            {state.nodes.map(node => (
                                <motion.g
                                    key={node.id}
                                    initial={node.isNew ? { scale: 0 } : { scale: 1 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={node.radius}
                                        fill={node.color}
                                        stroke={selectedNodes.includes(node) ? '#0000ff' : 'black'}
                                        strokeWidth={(selectedNodes.includes(node) ? 4 : 2) / transform.scale}
                                    />
                                    <text
                                        x={node.x}
                                        y={node.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize={12 / transform.scale}
                                    >
                                        {node.label}
                                    </text>
                                </motion.g>
                            ))}
                        </AnimatePresence>

                        {/* Annotations */}
                        {state.annotations.map(annotation => (
                            <g key={annotation.id} transform={`translate(${annotation.x},${annotation.y})`}>
                                <text
                                    fill={annotation.color || 'black'}
                                    fontSize={14 / transform.scale}
                                    className="select-none"
                                >
                                    {annotation.text}
                                </text>
                            </g>
                        ))}

                        {/* Preview line when drawing edges */}
                        {draggingFrom && (
                            <line
                                x1={draggingFrom.x}
                                y1={draggingFrom.y}
                                x2={mousePosition.x}
                                y2={mousePosition.y}
                                stroke="gray"
                                strokeWidth={2 / transform.scale}
                                strokeDasharray="4"
                            />
                        )}
                    </g>
                </svg>
            </Card>
        </div>
    );
};


export default GraphWhiteboard;