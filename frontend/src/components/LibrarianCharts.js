import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar as BarChart } from 'react-chartjs-2';
import { librarianService } from '../services/librarianService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const PALETTE = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1'];
const trunc = (s, n = 26) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

const baseOptions = (horizontal = false) => ({
  indexAxis: horizontal ? 'y' : 'x',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(33,37,41,0.95)' },
  },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
});

const EmptyChart = ({ message }) => (
  <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: '260px' }}>
    {message}
  </div>
);

const ChartCard = ({ title, children, badge }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
      <h6 className="mb-0 fw-bold">{title}</h6>
      {badge}
    </Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
);

const LibrarianCharts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    librarianService.getDashboardCharts()
      .then(setData)
      .catch(() => setError('Failed to load charts.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 text-muted">
        <Spinner animation="border" size="sm" className="me-2" /> Loading charts...
      </div>
    );
  }
  if (error || !data) return <p className="text-muted">{error || 'No chart data.'}</p>;

  const activity = {
    labels: data.rentalsOverTime?.map((b) => b.label) || [],
    datasets: [
      {
        label: 'Borrows',
        data: data.rentalsOverTime?.map((b) => b.borrows) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.65)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Students',
        type: 'line',
        data: data.rentalsOverTime?.map((b) => b.uniqueStudents) || [],
        borderColor: '#f5a623',
        backgroundColor: '#f5a623',
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  const activityOptions = {
    ...baseOptions(),
    plugins: {
      ...baseOptions().plugins,
      legend: { display: true, position: 'bottom' },
    },
  };

  const topBooks = {
    labels: data.topBooks?.map((b) => trunc(b.title)) || [],
    datasets: [{
      data: data.topBooks?.map((b) => b.count) || [],
      backgroundColor: PALETTE,
      borderRadius: 4,
    }],
  };

  const consistent = {
    labels: data.consistentStudents?.map((s) => `${trunc(s.name, 18)} (${s.onTimePercent}% on time)`) || [],
    datasets: [{
      data: data.consistentStudents?.map((s) => s.totalBorrows) || [],
      backgroundColor: data.consistentStudents?.map((s) =>
        s.onTimePercent >= 90 ? '#59a14f' : s.onTimePercent >= 70 ? '#edc948' : '#e15759') || [],
      borderRadius: 4,
    }],
  };

  const best = {
    labels: data.bestReviews?.map((b) => trunc(b.title)) || [],
    datasets: [{
      data: data.bestReviews?.map((b) => b.averageRating) || [],
      backgroundColor: '#59a14f',
      borderRadius: 4,
    }],
  };
  const worst = {
    labels: data.worstReviews?.map((b) => trunc(b.title)) || [],
    datasets: [{
      data: data.worstReviews?.map((b) => b.averageRating) || [],
      backgroundColor: '#e15759',
      borderRadius: 4,
    }],
  };
  const ratingOptions = { ...baseOptions(true), scales: { x: { beginAtZero: true, max: 5 }, y: { beginAtZero: true } } };

  const overdue = {
    labels: data.overdueStudents?.map((o) => `${trunc(o.studentName, 16)} — ${trunc(o.bookTitle, 18)}`) || [],
    datasets: [{
      data: data.overdueStudents?.map((o) => o.daysOverdue) || [],
      backgroundColor: '#e15759',
      borderRadius: 4,
    }],
  };

  return (
    <>
      <Row className="mt-4">
        <Col lg={12}>
          <ChartCard
            title="Student Borrowing Activity (last 12 weeks)"
            badge={<span className="badge bg-primary">{data.uniqueBorrowers} students have borrowed</span>}
          >
            <div style={{ height: '280px' }}>
              <BarChart data={activity} options={activityOptions} />
            </div>
          </ChartCard>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={6} className="mb-4">
          <ChartCard title="Most Borrowed Books">
            {data.topBooks?.length ? (
              <div style={{ height: '280px' }}>
                <BarChart data={topBooks} options={baseOptions(true)} />
              </div>
            ) : <EmptyChart message="No borrow data yet." />}
          </ChartCard>
        </Col>
        <Col lg={6} className="mb-4">
          <ChartCard title="Most Consistent Students" badge={<span className="text-muted small">bar color = on-time %</span>}>
            {data.consistentStudents?.length ? (
              <div style={{ height: '280px' }}>
                <BarChart data={consistent} options={baseOptions(true)} />
              </div>
            ) : <EmptyChart message="No borrow data yet." />}
          </ChartCard>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <ChartCard title="Best Reviewed Books" badge={<span className="badge bg-success">★ avg rating</span>}>
            {data.bestReviews?.length ? (
              <div style={{ height: '260px' }}>
                <BarChart data={best} options={ratingOptions} />
              </div>
            ) : <EmptyChart message="No student reviews yet." />}
          </ChartCard>
        </Col>
        <Col lg={6} className="mb-4">
          <ChartCard title="Worst Reviewed Books" badge={<span className="badge bg-danger">★ avg rating</span>}>
            {data.worstReviews?.length ? (
              <div style={{ height: '260px' }}>
                <BarChart data={worst} options={ratingOptions} />
              </div>
            ) : <EmptyChart message="No student reviews yet." />}
          </ChartCard>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <ChartCard
            title="Overdue Students"
            badge={data.overdueStudents?.length
              ? <span className="badge bg-danger">{data.overdueStudents.length} overdue</span>
              : <span className="badge bg-success">All caught up</span>}
          >
            {data.overdueStudents?.length ? (
              <div style={{ height: `${Math.max(160, Math.min(data.overdueStudents.length * 44, 420))}px` }}>
                <BarChart data={overdue} options={{
                  ...baseOptions(true),
                  plugins: {
                    ...baseOptions(true).plugins,
                    tooltip: {
                      backgroundColor: 'rgba(33,37,41,0.95)',
                      callbacks: { label: (ctx) => ` ${ctx.parsed.x} day(s) overdue` },
                    },
                  },
                }} />
              </div>
            ) : <EmptyChart message="No overdue books — great job, students!" />}
          </ChartCard>
        </Col>
      </Row>
    </>
  );
};

export default LibrarianCharts;
