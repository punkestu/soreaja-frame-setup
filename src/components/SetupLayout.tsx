import React from 'react';
import { TopNavbar } from './TopNavbar';
import { ConfigSidebar } from './ConfigSidebar';
import { CanvasWorkspace } from './CanvasWorkspace';
import { ExportModal } from './ExportModal';

export const SetupLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Top Application Bar */}
      <TopNavbar />

      {/* Split-screen Workspace */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Sidebar: Form inputs, metadata, slot list, asset upload */}
        <ConfigSidebar />

        {/* Center/Right: Interactive Konva Canvas workspace with 3-layer rendering */}
        <CanvasWorkspace />
      </div>

      {/* Export Modal for Visual Preview & JSON Payload generation */}
      <ExportModal />
    </div>
  );
};
