import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import features from './features/registry'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to={features[0].path} replace />} />
          {features.map(f => (
            <Route key={f.id} path={f.path} element={<f.component />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
