"use client";

import { useState, useMemo } from "react";
import { CircleDot, Plus, Trash2, RefreshCw } from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_NODES: NodeItem[] = [
  { id: "node-1", name: "Node A (us-east)", color: "#c45d3e" },
  { id: "node-2", name: "Node B (us-west)", color: "#2d5a7b" },
  { id: "node-3", name: "Node C (eu-central)", color: "#10b981" },
];

const SAMPLE_KEYS = [
  "user_1024",
  "session_9821",
  "order_4011",
  "cart_5519",
  "video_8820",
  "token_3311",
  "post_7702",
  "auth_9914",
];

// Simple deterministic hash to ring angle [0..359]
function hashToAngle(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

export default function ConsistentHashingLab() {
  const [nodes, setNodes] = useState<NodeItem[]>(DEFAULT_NODES);
  const [vnodesCount, setVnodesCount] = useState<number>(3); // virtual nodes per node

  // Compute ring positions for all virtual nodes
  const ringPoints = useMemo(() => {
    const points: { angle: number; nodeId: string; nodeName: string; color: string; label: string }[] = [];
    nodes.forEach((node) => {
      for (let v = 0; v < vnodesCount; v++) {
        const vKey = `${node.id}#v${v}`;
        const angle = hashToAngle(vKey);
        points.push({
          angle,
          nodeId: node.id,
          nodeName: node.name,
          color: node.color,
          label: `${node.name.split(" ")[1]}#v${v}`,
        });
      }
    });
    points.sort((a, b) => a.angle - b.angle);
    return points;
  }, [nodes, vnodesCount]);

  // Map each sample key to its owning node (first node clockwise)
  const keyAssignments = useMemo(() => {
    return SAMPLE_KEYS.map((key) => {
      const keyAngle = hashToAngle(key);
      // Find first node whose angle >= keyAngle, or wrap around to points[0]
      const owner = ringPoints.find((p) => p.angle >= keyAngle) || ringPoints[0];
      return {
        key,
        angle: keyAngle,
        ownerNode: owner ? owner.nodeName : "None",
        ownerColor: owner ? owner.color : "#999",
      };
    });
  }, [ringPoints]);

  const addNode = () => {
    const nextIdx = nodes.length + 1;
    const colors = ["#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
    const color = colors[nodes.length % colors.length];
    const newNode: NodeItem = {
      id: `node-${Date.now()}`,
      name: `Node ${String.fromCharCode(65 + nodes.length)} (region-${nextIdx})`,
      color,
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes(nodes.filter((n) => n.id !== id));
  };

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <CircleDot className="w-4 h-4" />
          Interactive Simulator 3
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Consistent Hashing Ring Visualizer
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Add or remove storage nodes and adjust virtual node counts. Observe how keys automatically resolve clockwise to their owning server, and how adding nodes redistributes only ~1/N keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* SVG Ring Visualizer */}
        <div className="flex justify-center items-center bg-background/50 p-6 rounded-2xl border border-border/70 relative">
          <svg viewBox="0 0 320 320" className="w-72 h-72 sm:w-80 sm:h-80">
            {/* Outer Circular Track */}
            <circle
              cx="160"
              cy="160"
              r="120"
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
              strokeDasharray="4 4"
            />

            {/* Virtual Node Points on the Ring */}
            {ringPoints.map((p, idx) => {
              const rad = (p.angle * Math.PI) / 180;
              const x = 160 + 120 * Math.cos(rad);
              const y = 160 + 120 * Math.sin(rad);

              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="6" fill={p.color} />
                  <title>{`${p.label} at ${p.angle}°`}</title>
                </g>
              );
            })}

            {/* Key Points placed slightly inside ring */}
            {keyAssignments.map((k, idx) => {
              const rad = (k.angle * Math.PI) / 180;
              const x = 160 + 100 * Math.cos(rad);
              const y = 160 + 100 * Math.sin(rad);

              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="3.5" fill="var(--foreground)" />
                  <title>{`${k.key} (${k.angle}°) -> ${k.ownerNode}`}</title>
                </g>
              );
            })}

            {/* Ring Center Label */}
            <text
              x="160"
              y="155"
              textAnchor="middle"
              className="text-xs font-mono font-bold fill-current"
            >
              HASH RING
            </text>
            <text
              x="160"
              y="175"
              textAnchor="middle"
              className="text-[10px] fill-current opacity-60"
            >
              {ringPoints.length} Virtual Nodes
            </text>
          </svg>
        </div>

        {/* Controls & Key Assignment Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cluster Nodes ({nodes.length})
            </span>
            <button
              onClick={addNode}
              disabled={nodes.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={13} />
              <span>Add Node</span>
            </button>
          </div>

          {/* Node list */}
          <div className="space-y-2">
            {nodes.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-background/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: n.color }}
                  />
                  <span className="font-semibold text-foreground">{n.name}</span>
                </div>
                <button
                  onClick={() => removeNode(n.id)}
                  disabled={nodes.length <= 1}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 disabled:opacity-30"
                  title="Remove Node"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Virtual nodes slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Virtual Nodes per Physical Server</span>
              <span className="font-mono text-accent">{vnodesCount} vnodes</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={vnodesCount}
              onChange={(e) => setVnodesCount(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="text-[11px] text-foreground-secondary">
              Higher vnodes ensure uniform load balance across server partitions.
            </p>
          </div>

          {/* Key mapping summary */}
          <div className="p-4 rounded-xl border border-border/70 bg-background/40 space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
              Sample Key Routing
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              {keyAssignments.slice(0, 6).map((k) => (
                <div key={k.key} className="flex items-center justify-between p-1.5 rounded bg-muted/40">
                  <span className="truncate mr-1">{k.key}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: k.ownerColor }}
                  >
                    {k.ownerNode.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
