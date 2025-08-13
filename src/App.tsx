import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AppInitializer } from "./components/AppInitializer";
import Dashboard from "./views/Dashboard";
import Management from "./views/Management";
import Statistics from "./views/Statistics";
import Settings from "./views/Settings";
import HabitDetail from "./views/HabitDetail";
import About from "./views/About";

const App: React.FC = () => {
  return (
    <AppInitializer>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="management" element={<Management />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="habit/:habitId" element={<HabitDetail />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </AppInitializer>
  );
};

export default App;
