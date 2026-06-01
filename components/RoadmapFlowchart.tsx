'use client';

import React, { useMemo } from 'react';

interface Cert {
  id: number;
  name: string;
  difficulty: number;
  prerequisites: string[];
  userStatus?: string;
  provider?: string;
  providerColor?: string;
  alternatives?: Cert[];
}

interface RoadmapFlowchartProps {
  certs: Cert[];
}

export default function RoadmapFlowchart({ certs }: RoadmapFlowchartProps) {
  // Calculate layout and dependencies
  const layout = useMemo(() => {
    // Build dependency graph
    const graph = new Map<number, Set<number>>();
    certs.forEach(cert => {
      graph.set(cert.id, new Set());
    });

    // Parse prerequisites and link certs
    certs.forEach(cert => {
      if (cert.prerequisites?.length > 0) {
        cert.prerequisites.forEach(prereq => {
          // Try to find matching cert by name or partial match
          const prereqCert = certs.find(
            c => c.name.toLowerCase().includes(prereq.toLowerCase().split(' or ')[0]) ||
                 prereq.toLowerCase().includes(c.name.toLowerCase())
          );
          if (prereqCert && prereqCert.id !== cert.id) {
            graph.get(prereqCert.id)?.add(cert.id);
          }
        });
      }
    });

    // Determine levels (topological sort)
    const levels: number[][] = [];
    const visited = new Set<number>();
    const nodeLevel = new Map<number, number>();

    const getLevel = (nodeId: number): number => {
      if (nodeLevel.has(nodeId)) return nodeLevel.get(nodeId)!;
      
      let maxPrevLevel = -1;
      // Find all nodes that point to this one
      graph.forEach((deps, fromId) => {
        if (deps.has(nodeId)) {
          maxPrevLevel = Math.max(maxPrevLevel, getLevel(fromId));
        }
      });

      const level = maxPrevLevel + 1;
      nodeLevel.set(nodeId, level);
      return level;
    };

    certs.forEach(cert => getLevel(cert.id));

    // Group by levels
    nodeLevel.forEach((level, nodeId) => {
      if (!levels[level]) levels[level] = [];
      levels[level].push(nodeId);
    });

    return { graph, levels, nodeLevel };
  }, [certs]);

  const getStatus = (cert: Cert) => {
    if (cert.userStatus === 'completed') return 'completed';
    if (cert.userStatus === 'in-progress') return 'in-progress';
    if (cert.userStatus === 'interested') return 'interested';
    return 'not-started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'interested':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ Completed';
      case 'in-progress':
        return '◐ In Progress';
      case 'interested':
        return '★ Interested';
      default:
        return 'Not Started';
    }
  };

  // Calculate positions
  const certWidth = 320;
  const levelWidth = certWidth + 50;
  const certHeight = 140;
  const levelHeight = 180;

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 12,
      padding: 24,
      overflow: 'auto',
      minHeight: 500,
    }}>
      <svg
        width="100%"
        height={Math.max(600, layout.levels.length * levelHeight)}
        style={{ minWidth: 1000 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="var(--text-secondary)" />
          </marker>
        </defs>

        {/* Draw arrows */}
        {Array.from(layout.graph.entries()).map(([fromId, deps]) => {
          return Array.from(deps).map(toId => {
            const fromCert = certs.find(c => c.id === fromId);
            const toCert = certs.find(c => c.id === toId);
            if (!fromCert || !toCert) return null;

            const fromLevel = layout.nodeLevel.get(fromId) || 0;
            const toLevel = layout.nodeLevel.get(toId) || 0;
            const fromIndex = layout.levels[fromLevel]?.indexOf(fromId) || 0;
            const toIndex = layout.levels[toLevel]?.indexOf(toId) || 0;

            const x1 = fromIndex * levelWidth + levelWidth / 2 + 50;
            const y1 = fromLevel * levelHeight + certHeight / 2 + 85;
            const x2 = toIndex * levelWidth + levelWidth / 2 + 50;
            const y2 = toLevel * levelHeight + certHeight / 2 + 85;

            return (
              <g key={`arrow-${fromId}-${toId}`}>
                <path
                  d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 30} ${x2} ${y2}`}
                  stroke="var(--text-secondary)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  opacity="0.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          });
        })}

        {/* Draw cert nodes */}
        {layout.levels.map((level, levelIdx) =>
          level.map((certId, certIdx) => {
            const cert = certs.find(c => c.id === certId);
            if (!cert) return null;

            const status = getStatus(cert);
            const statusColor = getStatusColor(status);
            const x = certIdx * levelWidth + 50;
            const y = levelIdx * levelHeight + 80;

            return (
              <g key={`cert-${cert.id}`}>
                {/* Background rect */}
                <rect
                  x={x}
                  y={y}
                  width={certWidth}
                  height={certHeight}
                  rx="8"
                  fill={statusColor}
                  opacity="0.1"
                  stroke={statusColor}
                  strokeWidth="2"
                />

                {/* Difficulty indicator */}
                <rect
                  x={x + 8}
                  y={y + 8}
                  width="24"
                  height="24"
                  rx="4"
                  fill={statusColor}
                />
                <text
                  x={x + 20}
                  y={y + 26}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fff"
                  fontWeight="bold"
                >
                  {cert.difficulty}
                </text>

                {/* Provider badge */}
                {cert.provider && (
                  <g>
                    <rect
                      x={x + certWidth - 80}
                      y={y + 8}
                      width="72"
                      height="24"
                      rx="4"
                      fill={cert.providerColor || 'var(--text-secondary)'}
                      opacity="0.15"
                      stroke={cert.providerColor || 'var(--text-secondary)'}
                      strokeWidth="1"
                    />
                    <text
                      x={x + certWidth - 44}
                      y={y + 26}
                      textAnchor="middle"
                      fontSize="10"
                      fill={cert.providerColor || 'var(--text-secondary)'}
                      fontWeight="600"
                    >
                      {cert.provider}
                    </text>
                  </g>
                )}

                {/* Cert name */}
                <text
                  x={x + 12}
                  y={y + 52}
                  fontSize="13"
                  fontWeight="600"
                  fill="var(--text-primary)"
                  style={{ pointerEvents: 'none' }}
                >
                  {cert.name}
                </text>
                {/* Tooltip title attribute for hover */}
                <title>{cert.name}</title>

                {/* Status badge */}
                <text
                  x={x + 12}
                  y={y + 120}
                  fontSize="11"
                  fill={statusColor}
                  fontWeight="500"
                  style={{ pointerEvents: 'none' }}
                >
                  {getStatusLabel(status)}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 24,
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
        fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }} />
          <span style={{ color: 'var(--text-secondary)' }}>In Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Interested</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#6b7280' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Not Started</span>
        </div>
      </div>
    </div>
  );
}
