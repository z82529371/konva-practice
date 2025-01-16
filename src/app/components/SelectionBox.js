import React from "react";
import { Rect } from "react-konva";

const SelectionBox = ({ box, index, onDragMove }) => {
  return (
    <Rect
      key={index}
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke="#1778ba"
      strokeWidth={3}
      draggable
      onDragMove={(e) => onDragMove(e, index)} // 傳遞拖動事件
    />
  );
};

export default SelectionBox;
