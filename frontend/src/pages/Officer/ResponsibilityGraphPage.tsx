import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import { Network, Filter, RotateCcw, X, Info, ShieldCheck, Building2, MapPin, FileText, CheckSquare } from 'lucide-react';
import { api } from '../../services/api';
import { GraphResponse } from '../../types';
import { CivicGraphNode } from '../../components/GraphNodeCustom';

export const ResponsibilityGraphPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rawGraph, setRawGraph] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Inspector Drawer State
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Filter types
  const [filterTypes, setFilterTypes] = useState<Record<string, boolean>>({
    complaint: true,
    incident: true,
    ward: true,
    department: true,
    action: true
  });

  const nodeTypes = useMemo(
    () => ({
      complaint: CivicGraphNode as any,
      incident: CivicGraphNode as any,
      ward: CivicGraphNode as any,
      department: CivicGraphNode as any,
      action: CivicGraphNode as any,
      evidence: CivicGraphNode as any
    }),
    []
  );

  const loadGraph = async () => {
    try {
      setLoading(true);
      const data = await api.getFullGraph();
      setRawGraph(data);
      applyFilter(data, filterTypes);
    } catch (err) {
      console.error("Failed to load responsibility graph", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const applyFilter = (data: GraphResponse, filters: Record<string, boolean>) => {
    const activeNodes = data.nodes.filter((n) => filters[n.type] !== false);
    const activeNodeIds = new Set(activeNodes.map((n) => n.id));

    const activeEdges = data.edges.filter(
      (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );

    setNodes(activeNodes as any);
    setEdges(activeEdges as any);
  };

  const handleToggleFilter = (type: string) => {
    const updated = { ...filterTypes, [type]: !filterTypes[type] };
    setFilterTypes(updated);
    if (rawGraph) {
      applyFilter(rawGraph, updated);
    }
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">

      {/* Top Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-gov shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-govblue" />
            <h1 className="text-base font-bold text-slate-900">
              Civic Responsibility Graph
            </h1>
            <span className="text-[10px] font-mono bg-[#EAF2FA] text-govblue px-2 py-0.5 rounded font-semibold border border-[#C2DBF2]">
              NetworkX Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dynamic relational topology connecting citizen grievances, municipal incidents, wards, departments, and recorded actions.
          </p>
        </div>

        {/* Legend / Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { type: 'complaint', label: 'Complaints', bg: 'bg-[#EAF2FA]', text: 'text-govblue', border: 'border-[#C2DBF2]' },
            { type: 'incident', label: 'Incidents', bg: 'bg-[#DDF3EF]', text: 'text-govteal', border: 'border-[#AEE4DB]' },
            { type: 'ward', label: 'Wards', bg: 'bg-[#E8F5EC]', text: 'text-emerald-800', border: 'border-[#B9E6C5]' },
            { type: 'department', label: 'Departments', bg: 'bg-[#FFF4D6]', text: 'text-amber-800', border: 'border-[#FFE299]' },
            { type: 'action', label: 'Actions', bg: 'bg-[#F1F5F9]', text: 'text-slate-700', border: 'border-[#CBD5E1]' }
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleToggleFilter(item.type)}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all flex items-center gap-1.5 ${filterTypes[item.type]
                  ? `${item.bg} ${item.text} ${item.border}`
                  : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={loadGraph}
            className="p-1.5 text-slate-500 hover:text-govblue rounded border border-slate-200 bg-white"
            title="Reload Graph"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Right Inspection Drawer */}
      <div className="flex-1 relative bg-white rounded-lg border border-[#CBD5E1] shadow-gov overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Constructing dynamic relational graph from database records...
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            className="bg-[#F8FAFC]"
          >
            <Background color="#CBD5E1" gap={20} size={1} />
            <Controls className="!bg-white !border !border-slate-300 !shadow-sm" />
            <MiniMap
              nodeStrokeColor="#315B8A"
              nodeColor="#EAF2FA"
              className="!border !border-slate-200 !bg-white/90 !rounded-md"
            />
          </ReactFlow>
        )}

        {/* Node Details Inspection Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-[#CBD5E1] p-4 space-y-3 z-30 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-govblue bg-[#EAF2FA] px-2 py-0.5 rounded">
                {selectedNode.data?.nodeType || 'Node Inspection'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                {selectedNode.data?.label || selectedNode.id}
              </p>
              {selectedNode.data?.code && (
                <p className="font-mono text-[11px] text-govblue font-bold mt-0.5">
                  Code: {selectedNode.data.code}
                </p>
              )}
            </div>

            {selectedNode.data?.details && (
              <div className="p-2.5 bg-[#F8FAFC] rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedNode.data.details}
              </div>
            )}

            <div className="space-y-1.5 text-xs border-t border-[#F1F5F9] pt-2">
              {selectedNode.data?.locality && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Locality:</span>
                  <strong className="text-slate-800">{selectedNode.data.locality}</strong>
                </div>
              )}
              {selectedNode.data?.category && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <strong className="text-slate-800">{selectedNode.data.category}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-govteal">{selectedNode.data?.status || 'Active'}</span>
              </div>
            </div>

            {selectedNode.data?.nodeType === 'complaint' && (
              <div className="pt-2">
                <a
                  href={`/officer/complaints/${selectedNode.id.replace('complaint-', '')}`}
                  className="block text-center w-full py-1.5 text-xs font-semibold text-white bg-govblue hover:bg-govblue-hover rounded transition-colors"
                >
                  Open Full Grievance Record →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
