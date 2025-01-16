import React from "react";
import { Rect } from "react-konva";

const CurrentSelectionBox = ({ box }) => {
  return (
    <Rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke="#1778ba"
      strokeWidth={3}
      dash={[10, 5]} // 虛線樣式
    />
  );
};

export default CurrentSelectionBox;
