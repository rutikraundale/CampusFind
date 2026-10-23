import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/admin/dashboard': 'Administrative Overview',
  '/admin/claims': 'Claims Ledger',
  '/admin/handover': 'Physical Handover',
  '/admin/report': 'Report an Item',
  '/admin/records': 'Item Registry',
};

export default function AdminMasthead() {
  const { pathname } = useLocation();
  const pageTitle = pageTitles[pathname] || 'Administrative Office';

  return (
    <header style={{
      marginBottom: '28px',
      padding: '20px 0 18px',
      borderBottom: '3px double var(--color-stone)',
      textAlign: 'center',
    }}>
      <h1 style={{
        margin: 0,
        color: 'var(--color-ink)',
        font: '400 clamp(30px, 4vw, 44px)/1.05 var(--font-cursorgothic)',
        letterSpacing: '0.035em',
      }}>
        ADMINISTRATION PANEL
      </h1>
      <p style={{
        margin: '9px 0 0',
        color: 'var(--color-ash)',
        font: '400 11px var(--font-berkeleymono)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {pageTitle}
      </p>
    </header>
  );
}
