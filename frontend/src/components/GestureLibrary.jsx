import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Box,
  Layers,
  HelpCircle,
  Play,
  Info,
  CheckCircle2,
  FolderOpen,
  X,
  Camera,
  Check
} from 'lucide-react';
import gestureCatalog from '../data/gestureClasses.json';
import { soundFX } from '../services/soundFx';

export default function GestureLibrary({ onSelectGesture = null }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = (gestureCatalog.categories || [
    { id: 'all', label: 'All Signs' }
  ]).map((cat) => ({
    ...cat,
    count: cat.id === 'all' 
      ? gestureCatalog.classes.length 
      : gestureCatalog.classes.filter((item) => item.category === cat.id).length
  }));

  const filteredClasses = gestureCatalog.classes.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (item) => {
    soundFX.playClick();
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleTestInCamera = (item) => {
    soundFX.playClick();
    setModalOpen(false);
    if (onSelectGesture) {
      onSelectGesture(item);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Extensible ISL Dataset Registry</span>
          </div>
          <h2 className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight">
            Indian Sign Language (ISL) Gesture Library
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm mt-2 leading-relaxed">
            Standardized static & dynamic gesture reference catalogue. Trainable via MediaPipe 21-landmark neural classifier or raw image crops.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              Total Classes: <strong className="text-cyan-400">{gestureCatalog.classes.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              Architecture: <strong className="text-emerald-400">83-D Landmark Vector</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model Supported: <strong className="text-emerald-400">✓ 100%</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFX.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ISL gestures or description..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-display"
          />
        </div>
      </div>

      {/* Gesture Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClasses.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isDynamic = item.type === 'dynamic';

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-indigo-950/20 shadow-cyan'
                  : 'border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/60'
              }`}
            >
              <div>
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                    item.category === 'emergency'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.category === 'alphabet'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : item.category === 'numbers'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.category.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className={`px-1.5 py-0.5 rounded ${
                      isDynamic ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDynamic ? '⚡ Dynamic' : 'Static'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.difficulty || 'Easy'}
                    </span>
                  </div>
                </div>

                {/* Hand Shape Graphic Frame / Placeholder */}
                <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center p-3 mb-3 relative overflow-hidden group-hover:border-indigo-500/40 transition-colors">
                  <div className="text-3xl mb-1 filter drop-shadow-md">
                    {item.category === 'alphabet' ? '🔤' : item.category === 'numbers' ? '🔢' : '🤟'}
                  </div>
                  <span className="font-display font-black text-lg text-white tracking-wider">
                    {item.id}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">
                    ISL Reference Sign
                  </span>
                </div>

                {/* Gesture Title & Description */}
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-100 flex items-center justify-between">
                    <span>{item.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">
                  ID: <strong className="text-slate-300">{item.id}</strong>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(item);
                  }}
                  className="glass-button text-[11px] py-1 px-2.5 text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  <Info className="w-3 h-3 text-indigo-400" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="font-display text-sm">No gestures found matching "{searchQuery}".</p>
        </div>
      )}

      {/* Modal Detail Pop-up */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-800 shadow-2xl relative space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    Sign Details: {selectedItem.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Category: {selectedItem.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reference Visual Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-4xl filter drop-shadow-lg">
                {selectedItem.category === 'alphabet' ? '🔤' : selectedItem.category === 'numbers' ? '🔢' : '🤟'}
              </div>
              <h4 className="font-display font-black text-2xl text-white tracking-widest">
                {selectedItem.id}
              </h4>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  Type: <strong className="text-cyan-300">{selectedItem.type === 'dynamic' ? '⚡ Dynamic' : 'Static'}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  Model Supported: <strong className="text-emerald-400">✓ YES</strong>
                </span>
              </div>
            </div>

            {/* Anatomical description */}
            <div className="space-y-1 text-xs">
              <span className="font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Anatomical Configuration & Movement:
              </span>
              <p className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                {selectedItem.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="glass-button text-xs py-2 px-4 text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => handleTestInCamera(selectedItem)}
                className="glass-button text-xs py-2 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Try with Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
