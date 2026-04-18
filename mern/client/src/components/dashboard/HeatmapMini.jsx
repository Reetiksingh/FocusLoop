export function HeatmapMini({ items }) {
  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div>
          <p className="eyebrow">Consistency map</p>
          <h3>Last 35 days</h3>
        </div>
        <p className="micro-copy">Low to high activity</p>
      </div>

      <div className="heatmap-grid">
        {items.map(item => (
          <div
            key={item.date}
            className="heatmap-cell"
            data-level={item.level}
            title={`${item.date}: ${item.score} activity points`}
          />
        ))}
      </div>
    </div>
  );
}
