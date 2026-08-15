import React, { useMemo, useState } from 'react';
import {
  Button,
  Tag,
  Search,
  Dropdown,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { Add, CheckmarkFilled, Time, Filter } from '@carbon/icons-react';
import { Contribution } from '../../types';
import './MyContributions.scss';

const categoryColor = (c: string) => {
  switch (c) {
    case 'Outcomes':
      return 'blue';
    case 'Skills':
      return 'purple';
    case 'Behaviors':
      return 'teal';
    case 'Leadership':
      return 'green';
    case 'Client Success':
      return 'cyan';
    default:
      return 'gray';
  }
};

const impactClass = (impact: string) => {
  if (impact.startsWith('Critical')) return 'impact--critical';
  if (impact.startsWith('High')) return 'impact--high';
  if (impact.startsWith('Medium')) return 'impact--medium';
  return 'impact--low';
};

interface MyContributionsProps {
  contributions: Contribution[];
  quarterCount: number;
  onOpenLog: () => void;
}

const MyContributions: React.FC<MyContributionsProps> = ({
  contributions,
  quarterCount,
  onOpenLog,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Dimensions');
  const [impactFilter, setImpactFilter] = useState('All Impact');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const CATEGORY_OPTIONS = ['All Dimensions', 'Outcomes', 'Skills', 'Behaviors', 'Leadership', 'Client Success'];
  const IMPACT_OPTIONS = ['All Impact', 'Critical Impact', 'High Impact', 'Medium Impact', 'Low Impact'];
  const STATUS_OPTIONS = ['All Status', 'Verified', 'Pending'];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contributions.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.evidence || []).some((e) => e.toLowerCase().includes(q));
      const matchesCategory =
        categoryFilter === 'All Dimensions' || r.category === categoryFilter;
      const matchesImpact =
        impactFilter === 'All Impact' || r.impact === impactFilter;
      const matchesStatus =
        statusFilter === 'All Status' ||
        (statusFilter === 'Verified' && r.verified) ||
        (statusFilter === 'Pending' && !r.verified);
      return matchesQuery && matchesCategory && matchesImpact && matchesStatus;
    });
  }, [contributions, query, categoryFilter, impactFilter, statusFilter]);

  const activeFilterCount =
    (categoryFilter !== 'All Dimensions' ? 1 : 0) +
    (impactFilter !== 'All Impact' ? 1 : 0) +
    (statusFilter !== 'All Status' ? 1 : 0);

  return (
    <div className="my-contributions">
      <div className="my-contributions__header">
        <div>
          <h3 className="my-contributions__title">My Contributions</h3>
          <p className="my-contributions__subtitle">
            {quarterCount} contributions this quarter • auto-classified and verified
          </p>
        </div>
        <Button kind="primary" renderIcon={Add} onClick={onOpenLog}>
          Log New Contribution
        </Button>
      </div>

      <div className="my-contributions__filters">
        <Search
          size="lg"
          labelText="Search contributions"
          placeholder="Search by title, dimension, or evidence…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="my-contributions__search"
        />
        <div className="my-contributions__dropdowns">
          <span className="my-contributions__filter-label">
            <Filter size={14} />
            {activeFilterCount > 0 && (
              <span className="my-contributions__filter-count">{activeFilterCount}</span>
            )}
          </span>
          <Dropdown
            id="filter-dimension"
            size="lg"
            label="All Dimensions"
            titleText=""
            hideLabel
            items={CATEGORY_OPTIONS}
            selectedItem={categoryFilter}
            onChange={({ selectedItem }: { selectedItem: string | null }) =>
              setCategoryFilter(selectedItem || 'All Dimensions')
            }
          />
          <Dropdown
            id="filter-impact"
            size="lg"
            label="All Impact"
            titleText=""
            hideLabel
            items={IMPACT_OPTIONS}
            selectedItem={impactFilter}
            onChange={({ selectedItem }: { selectedItem: string | null }) =>
              setImpactFilter(selectedItem || 'All Impact')
            }
          />
          <Dropdown
            id="filter-status"
            size="lg"
            label="All Status"
            titleText=""
            hideLabel
            items={STATUS_OPTIONS}
            selectedItem={statusFilter}
            onChange={({ selectedItem }: { selectedItem: string | null }) =>
              setStatusFilter(selectedItem || 'All Status')
            }
          />
        </div>
      </div>

      <div className="my-contributions__table dashboard-card">
        <Table size="lg" useZebraStyles={false}>
          <TableHead>
            <TableRow>
              <TableHeader>Contribution</TableHeader>
              <TableHeader>Dimension</TableHeader>
              <TableHeader>Impact</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="cell-title">{r.title}</p>
                  {r.evidence && r.evidence.length > 0 && (
                    <div className="cell-evidence">
                      {r.evidence.map((e) => (
                        <span key={e} className="evidence-chip">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Tag type={categoryColor(r.category)} size="sm">
                    {r.category}
                  </Tag>
                </TableCell>
                <TableCell>
                  <span className={`impact ${impactClass(r.impact)}`}>
                    {r.impact.replace(' Impact', '')}
                  </span>
                </TableCell>
                <TableCell className="cell-date">{r.date}</TableCell>
                <TableCell>
                  {r.verified ? (
                    <span className="status status--verified">
                      <CheckmarkFilled size={16} /> Verified
                    </span>
                  ) : (
                    <span className="status status--pending">
                      <Time size={16} /> Pending
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <p className="my-contributions__empty">
            No contributions match your filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyContributions;

// Made with Bob
