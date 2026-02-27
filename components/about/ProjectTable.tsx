'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/products';

const CATEGORY_LABELS: Record<Product['category'], string> = {
  agent: 'Agents',
  plugin: 'Plugins',
  product: 'Products',
  infrastructure: 'Infra',
};

const CATEGORY_COLORS: Record<Product['category'], string> = {
  agent: 'text-accent border-accent',
  plugin: 'text-[#00d4ff] border-[#00d4ff]',
  product: 'text-[#facc15] border-[#facc15]',
  infrastructure: 'text-[#a855f7] border-[#a855f7]',
};

function formatDate(date: string) {
  const [year, month] = date.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

interface ProjectTableProps {
  products: Product[];
}

export function ProjectTable({ products }: ProjectTableProps) {
  const [activeFilter, setActiveFilter] = useState<Product['category'] | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(products[0]?.id ?? null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return products;
    return products.filter((p) => p.category === activeFilter);
  }, [products, activeFilter]);

  const toggleRow = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div>
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filter builds by category">
        <button
          role="tab"
          aria-selected={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
            activeFilter === 'all'
              ? 'bg-text text-background border-text'
              : 'bg-transparent text-muted border-text/20 hover:border-text/50 hover:text-text'
          }`}
        >
          All ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={activeFilter === cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                activeFilter === cat
                  ? 'bg-text text-background border-text'
                  : 'bg-transparent text-muted border-text/20 hover:border-text/50 hover:text-text'
              }`}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div role="tabpanel" className="border border-text/20">
        {/* Header Row */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-text/20 text-xs font-bold uppercase tracking-wider text-muted">
          <span>Name</span>
          <span className="w-20 text-right">Date</span>
          <span className="w-16 text-right">Type</span>
        </div>

        {/* Rows */}
        <AnimatePresence mode="popLayout">
          {filtered.map((product, i) => {
            const isExpanded = expandedId === product.id;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={i < filtered.length - 1 ? 'border-b border-muted/30' : ''}
              >
                {/* Row */}
                <button
                  type="button"
                  onClick={() => toggleRow(product.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 transition-colors duration-100 hover:bg-surface focus:outline-none focus:bg-surface focus:ring-2 focus:ring-inset focus:ring-accent cursor-pointer"
                >
                  {/* Name + chevron */}
                  <span className="font-bold text-text flex items-center gap-2">
                    <svg
                      className={`w-3 h-3 text-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {product.name}
                  </span>

                  {/* Date */}
                  <span className="hidden sm:flex w-20 items-center justify-end text-xs text-muted tabular-nums">
                    {formatDate(product.date)}
                  </span>

                  {/* Category Badge */}
                  <span className="hidden sm:flex w-16 items-center justify-end">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${CATEGORY_COLORS[product.category]}`}
                    >
                      {CATEGORY_LABELS[product.category].replace(/s$/, '')}
                    </span>
                  </span>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pt-3 pb-4 pl-9 sm:pl-9">
                        <p className="text-sm text-muted leading-relaxed mb-3 max-w-2xl">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline underline-offset-4 decoration-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                          >
                            View Project
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                          {/* Mobile-only date + badge */}
                          <span className="sm:hidden flex items-center gap-2 text-xs text-muted">
                            <span className="tabular-nums">{formatDate(product.date)}</span>
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${CATEGORY_COLORS[product.category]}`}>
                              {CATEGORY_LABELS[product.category].replace(/s$/, '')}
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-text/20 text-xs text-muted font-semibold tabular-nums">
          {filtered.length} build{filtered.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' && (
            <span> in {CATEGORY_LABELS[activeFilter].toLowerCase()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
