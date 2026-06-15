import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 16px'}}>
      <div style={{fontSize:'72px', fontWeight:800, color:'var(--accent)', lineHeight:1}}>404</div>
      <h1 style={{fontSize:'1.5rem', fontWeight:700, marginTop:'16px', marginBottom:'8px'}}>Page Not Found</h1>
      <p style={{color:'var(--text-secondary)', marginBottom:'24px'}}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
    </div>
  );
}
