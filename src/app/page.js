"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DrawingBoard from "./page/Drawingboard";

function MyApp() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DrawingBoard />
    </DndProvider>
  );
}

export default MyApp;
