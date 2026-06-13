import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './config';
import { ModeSelect, GameMenu, AdultsMenu, BowlGame, VolunteerKitchen, ElevenCents, DonationCalculator, GetInvolved } from './screens';
import './styles/global.css';

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          {/* Main entry point */}
          <Route path="/" element={<ModeSelect />} />
          
          {/* Kids mode routes */}
          <Route path="/kids" element={<GameMenu />} />
          <Route path="/kids/bowl" element={<BowlGame />} />
          <Route path="/kids/kitchen" element={<VolunteerKitchen />} />
          <Route path="/kids/map" element={<PlaceholderScreen title="Mapa sveta" />} />
          <Route path="/kids/bell" element={<PlaceholderScreen title="Školský zvonček" />} />
          
          {/* Adults mode routes */}
          <Route path="/adults" element={<AdultsMenu />} />
          <Route path="/adults/eleven-cents" element={<ElevenCents />} />
          <Route path="/adults/calculator" element={<DonationCalculator />} />
          <Route path="/adults/get-involved" element={<GetInvolved />} />
          <Route path="/adults/school-feeding" element={<PlaceholderScreen title="Školské stravovanie" />} />
          <Route path="/adults/stories" element={<PlaceholderScreen title="Príbehy" />} />
          
          {/* 404 */}
          <Route path="*" element={<PlaceholderScreen title="Stránka nenájdená" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

/** Temporary placeholder for screens not yet implemented */
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem',
    }}>
      <h1>{title}</h1>
      <p style={{ color: '#666' }}>Táto obrazovka bude čoskoro implementovaná</p>
      <a href="/" style={{ color: '#009ddc' }}>Späť na hlavnú stránku</a>
    </div>
  );
}

export default App;
