import type { EdgeType, NodeType } from '@/lib/types';
import { useCallback, useEffect, useRef } from 'react';

export const usePhysics = (
    nodes: NodeType[],
    edges: EdgeType[],
    setNodes: (nodes: NodeType[]) => void
) => {
    const animationFrame = useRef<number>();
    const lastTime = useRef<number>(0);

    const updatePhysics = useCallback((timestamp: number) => {
        const deltaTime = (timestamp - lastTime.current) / 1000;
        lastTime.current = timestamp;

        const damping = 0.8;
        const springStrength = 0.03;
        const repulsionStrength = 1000;
        const centerAttraction = 0.0001;

        const updatedNodes = nodes.map(node => {
            const force = { x: 0, y: 0 };

            // Repulsion between nodes
            nodes.forEach(other => {
                if (other.id === node.id) return;
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance === 0) return;

                const repulsion = repulsionStrength / (distance * distance);
                force.x += (dx / distance) * repulsion;
                force.y += (dy / distance) * repulsion;
            });

            // Spring forces from edges
            edges.forEach(edge => {
                if (edge.from === node.id || edge.to === node.id) {
                    const other = nodes.find(n =>
                        n.id === (edge.from === node.id ? edge.to : edge.from)
                    );
                    if (!other) return;

                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance === 0) return;

                    const springForce = (distance - (edge.length || 100)) * springStrength;
                    force.x -= (dx / distance) * springForce;
                    force.y -= (dy / distance) * springForce;
                }
            });

            // Center attraction
            force.x -= node.x * centerAttraction;
            force.y -= node.y * centerAttraction;

            // Update velocity and position
            const velocity = {
                x: (node.physics.velocity.x + force.x * deltaTime) * damping,
                y: (node.physics.velocity.y + force.y * deltaTime) * damping
            };

            return {
                ...node,
                x: node.x + velocity.x * deltaTime,
                y: node.y + velocity.y * deltaTime,
                physics: {
                    velocity,
                    force
                }
            };
        });

        setNodes(updatedNodes);
        animationFrame.current = requestAnimationFrame(updatePhysics);
    }, [nodes, edges, setNodes]);

    useEffect(() => {
        animationFrame.current = requestAnimationFrame(updatePhysics);
        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [updatePhysics]);
};