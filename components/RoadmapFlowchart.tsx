'use client';

import React, { useMemo } from 'react';
import {
  buildRoadmapGraph,
  computeNodeLevels,
  groupCertsByLevel,
} from '@/lib/roadmapGraph';

interface Cert {
  id: number;
  name: string;
  difficulty: number;
  prerequisites?: string[];
  next_certs?: string[];
  userStatus?: string;
  provider?: string;
  providerColor?: string;
  alternatives?: Cert[];
}

interface RoadmapFlowchartProps {
  certs: Cert[];
}

const CERT_WIDTH = 320;
const LEVEL_WIDTH = CERT_WIDTH + 50;
const CERT_HEIGHT = 140;
const LEVEL_HEIGHT = 180;
const PADDING_LEFT = 50;
const PADDING_TOP = 80;

export default function RoadmapFlowchart({ certs }: RoadmapFlowchartProps) {
  const layout = useMemo(() => {
    const graph = buildRoadmapGraph(certs);
    const nodeLevel = computeNodeLevels(
      graph,
      certs.map((c) => c.id)
    );
    const levels = groupCertsByLevel(nodeLevel);

    const positions = new Map<
      number,
      { x: number; y: number; cx: number; cy: number }
    >();

    levels.forEach((level, levelIdx) => {
      level.forEach((certId, certIdx) => {
        const x = certIdx * LEVEL_WIDTH + PADDING_LEFT;
        const y = levelIdx * LEVEL_HEIGHT + PADDING_TOP;
        positions.set(certId, {
          x,
          y,
          cx: x + CERT_WIDTH / 2,
          cy: y + CERT_HEIGHT / 2,
        });
      });
    });

    return { graph, levels, nodeLevel, positions };
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

  const edges: { fromId: number; toId: number }[] = [];
  layout.graph.forEach((deps, fromId) => {
    deps.forEach((toId) => {
      if (layout.positions.has(fromId) && layout.positions.has(toId)) {
        edges.push({ fromId, toId });
      }
    });
  });

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 24,
        overflow: 'auto',
        minHeight: 500,
      }}
    >
      <svg
        width="100%"
        height={Math.max(600, layout.levels.length * LEVEL_HEIGHT)}
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

        {edges.map(({ fromId, toId }) => {
          const from = layout.positions.get(fromId)!;
          const to = layout.positions.get(toId)!;

          return (
            <g key={`arrow-${fromId}-${toId}`}>
              <path
                d={`M ${from.cx} ${from.cy} Q ${(from.cx + to.cx) / 2} ${(from.cy + to.cy) / 2 + 30} ${to.cx} ${to.cy}`}
                stroke="var(--text-secondary)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.5"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {layout.levels.map((level, levelIdx) =>
          level.map((certId) => {
            const cert = certs.find((c) => c.id === certId);
            const pos = layout.positions.get(certId);
            if (!cert || !pos) return null;

            const status = getStatus(cert);
            const statusColor = getStatusColor(status);

            return (
              <g key={`cert-${cert.id}`}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={CERT_WIDTH}
                  height={CERT_HEIGHT}
                  rx="8"
                  fill={statusColor}
                  opacity="0.1"
                  stroke={statusColor}
                  strokeWidth="2"
                />

                <rect
                  x={pos.x + 8}
                  y={pos.y + 8}
                  width="24"
                  height="24"
                  rx="4"
                  fill={statusColor}
                />
                <text
                  x={pos.x + 20}
                  y={pos.y + 26}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fff"
                  fontWeight="bold"
                >
                  {cert.difficulty}
                </text>

                {cert.provider && (
                  <g>
                    <rect
                      x={pos.x + CERT_WIDTH - 80}
                      y={pos.y + 8}
                      width="72"
                      height="24"
                      rx="4"
                      fill={cert.providerColor || 'var(--text-secondary)'}
                      opacity="0.15"
                      stroke={cert.providerColor || 'var(--text-secondary)'}
                      strokeWidth="1"
                    />
                    <text
                      x={pos.x + CERT_WIDTH - 44}
                      y={pos.y + 26}
                      textAnchor="middle"
                      fontSize="10"
                      fill={cert.providerColor || 'var(--text-secondary)'}
                      fontWeight="600"
                    >
                      {cert.provider}
                    </text>
                  </g>
                )}

                <text
                  x={pos.x + 12}
                  y={pos.y + 52}
                  fontSize="13"
                  fontWeight="600"
                  fill="var(--text-primary)"
                  style={{ pointerEvents: 'none' }}
                >
                  {cert.name}
                </text>
                <title>{cert.name}</title>

                <text
                  x={pos.x + 12}
                  y={pos.y + 120}
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

      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>In Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Interested</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 12, height: 12, borderRadius: 3, background: '#6b7280' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Not Started</span>
        </div>
      </div>
    </div>
  );
}
